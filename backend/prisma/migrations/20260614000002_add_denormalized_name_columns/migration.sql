-- ============================================================
-- Add denormalized display-name columns required by existing
-- controllers/services that the V2 redesign omitted:
--   - meal_entries.food_name      (mirrors food_items.name,
--     required by dailyMealPlans.controller.js)
--   - plan_exercises.exercise_name (mirrors exercises.name,
--     required by services/planGenerator.js)
--   - log_exercises.exercise_name  (mirrors exercises.name,
--     required by workoutLogs.controller.js)
--
-- NOTE: written for the current dev database, which has empty
-- tables. If applying to a database that already contains rows,
-- add each column as NULL first, backfill via a JOIN to the
-- referenced food_items/exercises row (matching on
-- food_item_id/exercise_id), then ALTER to NOT NULL.
-- ============================================================

-- ---------- MEAL ENTRIES (meal_food_items) ----------
ALTER TABLE `meal_entries`
  ADD COLUMN `food_name` VARCHAR(100) NOT NULL AFTER `food_item_id`;

-- ---------- PLAN EXERCISES ----------
ALTER TABLE `plan_exercises`
  ADD COLUMN `exercise_name` VARCHAR(100) NOT NULL AFTER `exercise_id`;

-- ---------- LOG EXERCISES ----------
ALTER TABLE `log_exercises`
  ADD COLUMN `exercise_name` VARCHAR(100) NOT NULL AFTER `exercise_id`;
