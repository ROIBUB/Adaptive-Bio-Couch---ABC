-- ============================================================
-- Schema V2 redesign: align MySQL schema with existing backend
-- contracts (users, settings, exercises, food items, daily meal
-- plans -> meals -> meal food items, workout plan days, workout
-- logs, log sets, enum standardization).
--
-- NOTE: written for the current dev database, which has empty
-- tables. If applying to a database that already contains rows,
-- see the "manual steps for populated databases" notes for each
-- section before running the corresponding statements.
-- ============================================================

-- ---------- USERS ----------
-- Populated DBs: add first_name/last_name as NULL first, backfill
-- from `name` (e.g. split on first space), then add NOT NULL and
-- drop `name` in a follow-up statement.
ALTER TABLE `users`
  ADD COLUMN `first_name` VARCHAR(50) NOT NULL AFTER `id`,
  ADD COLUMN `last_name` VARCHAR(50) NOT NULL AFTER `first_name`,
  ADD COLUMN `preferences` INTEGER NULL,
  DROP COLUMN `name`;

-- ---------- SETTINGS (new table) ----------
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `display_name` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `theme` VARCHAR(20) NULL DEFAULT 'light',
    `fitness_goal` VARCHAR(50) NULL,
    `activity_level` INTEGER NULL,

    UNIQUE INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- ---------- EXERCISES ----------
-- Populated DBs: existing lowercase `difficulty` values
-- ('beginner'/'intermediate'/'advanced') must be converted to
-- Title Case BEFORE this MODIFY COLUMN, e.g.:
--   UPDATE exercises SET difficulty = CONCAT(UPPER(LEFT(difficulty,1)), SUBSTRING(difficulty,2));
ALTER TABLE `exercises`
  ADD COLUMN `equipment` VARCHAR(100) NULL,
  ADD COLUMN `description` TEXT NULL,
  MODIFY COLUMN `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') NULL;

-- ---------- FOOD ITEMS ----------
ALTER TABLE `food_items`
  ADD COLUMN `category` VARCHAR(50) NULL;

-- ---------- DAILY MEAL PLANS ----------
ALTER TABLE `daily_meal_plans`
  ADD COLUMN `fitness_goal` ENUM('weight_loss', 'muscle_gain', 'maintenance') NULL,
  ADD COLUMN `created_at` DATE NULL DEFAULT (curdate());

-- ---------- MEALS (new table) ----------
CREATE TABLE `meals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_meal_plan_id` INTEGER NOT NULL,
    `meal_type` ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `estimated_calories` INTEGER NOT NULL,
    `estimated_protein` INTEGER NOT NULL,

    INDEX `daily_meal_plan_id`(`daily_meal_plan_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `meals`
  ADD CONSTRAINT `meals_ibfk_1` FOREIGN KEY (`daily_meal_plan_id`) REFERENCES `daily_meal_plans`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- ---------- MEAL_ENTRIES -> repurposed as MEAL_FOOD_ITEMS ----------
-- Populated DBs: before dropping `meal_plan_id`/`meal_type`, first
-- create one `meals` row per (daily_meal_plan_id, meal_type) group
-- (with real title/estimated_calories/estimated_protein values),
-- then backfill a new nullable `meal_id` column on `meal_entries`
-- by matching `meal_plan_id` + `meal_type` to the new `meals` row,
-- and only then run the statements below.
ALTER TABLE `meal_entries`
  DROP FOREIGN KEY `meal_entries_ibfk_1`;

ALTER TABLE `meal_entries`
  DROP INDEX `meal_plan_id`;

ALTER TABLE `meal_entries`
  CHANGE COLUMN `meal_plan_id` `meal_id` INTEGER NOT NULL,
  DROP COLUMN `meal_type`,
  DROP COLUMN `calories_total`;

ALTER TABLE `meal_entries`
  ADD INDEX `meal_id`(`meal_id` ASC);

ALTER TABLE `meal_entries`
  ADD CONSTRAINT `meal_entries_ibfk_1` FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- ---------- WORKOUT PLAN DAYS ----------
-- Populated DBs: add `day` as NULL first, backfill from
-- `day_number` via an explicit mapping (e.g. 1=Sunday..7=Saturday),
-- then set NOT NULL and drop `day_number` in a follow-up statement.
ALTER TABLE `workout_plan_days`
  ADD COLUMN `day` ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  DROP COLUMN `day_number`;

-- ---------- WORKOUT LOGS ----------
ALTER TABLE `workout_logs`
  ADD COLUMN `workout_plan_day_id` INTEGER NULL,
  ADD COLUMN `workout_title` VARCHAR(100) NULL,
  ADD COLUMN `difficulty_rating` INTEGER NULL;

ALTER TABLE `workout_logs`
  ADD INDEX `workout_plan_day_id`(`workout_plan_day_id` ASC);

ALTER TABLE `workout_logs`
  ADD CONSTRAINT `workout_logs_ibfk_3` FOREIGN KEY (`workout_plan_day_id`) REFERENCES `workout_plan_days`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- ---------- LOG SETS ----------
ALTER TABLE `log_sets`
  ADD COLUMN `set_number` INTEGER NULL;
