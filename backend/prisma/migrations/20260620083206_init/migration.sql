-- CreateTable
CREATE TABLE `ai_recommendations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `generated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `weight_assessment` TEXT NULL,
    `nutrition_assessment` TEXT NULL,
    `workout_assessment` TEXT NULL,
    `recommendations` JSON NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `check_ins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `weight` FLOAT NOT NULL,
    `workouts_completed` INTEGER NOT NULL,
    `feedback` TEXT NULL,
    `check_in_date` DATETIME(0) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_meal_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_name` VARCHAR(150) NOT NULL,
    `target_calories` INTEGER NULL,
    `target_protein` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `fitness_goal` ENUM('weight_loss', 'muscle_gain', 'maintenance') NULL,
    `created_at` DATE NULL DEFAULT (curdate()),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `muscle_group` VARCHAR(50) NULL,
    `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') NULL,
    `equipment` VARCHAR(100) NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `food_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `calories_per_100g` FLOAT NOT NULL,
    `protein_per_100g` FLOAT NULL,
    `carbs_per_100g` FLOAT NULL,
    `fat_per_100g` FLOAT NULL,
    `category` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workout_log_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,
    `exercise_name` VARCHAR(100) NOT NULL,

    INDEX `exercise_id`(`exercise_id`),
    INDEX `workout_log_id`(`workout_log_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_sets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `log_exercise_id` INTEGER NOT NULL,
    `reps` INTEGER NOT NULL,
    `weight_kg` FLOAT NULL,
    `set_number` INTEGER NULL,

    INDEX `log_exercise_id`(`log_exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `daily_meal_plan_id` INTEGER NOT NULL,
    `meal_type` ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `estimated_calories` INTEGER NOT NULL,
    `estimated_protein` INTEGER NOT NULL,

    INDEX `daily_meal_plan_id`(`daily_meal_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meal_id` INTEGER NOT NULL,
    `food_item_id` INTEGER NOT NULL,
    `food_name` VARCHAR(100) NOT NULL,
    `quantity_grams` FLOAT NOT NULL,

    INDEX `food_item_id`(`food_item_id`),
    INDEX `meal_id`(`meal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,
    `exercise_name` VARCHAR(100) NOT NULL,
    `target_sets` INTEGER NULL,
    `target_reps` INTEGER NULL,
    `target_weight` FLOAT NULL,

    INDEX `day_id`(`day_id`),
    INDEX `exercise_id`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `age` INTEGER NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `height_cm` FLOAT NULL,
    `current_weight` FLOAT NULL,
    `target_weight` FLOAT NULL,
    `fitness_goal` ENUM('weight_loss', 'muscle_gain', 'maintenance') NOT NULL,
    `activity_level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    `workouts_per_week` INTEGER NULL DEFAULT 3,
    `meals_per_day` INTEGER NULL DEFAULT 3,
    `assigned_workout_plan_id` INTEGER NULL,
    `assigned_meal_plan_id` INTEGER NULL,
    `caloric_target` FLOAT NULL,
    `onboarding_completed` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `user_id`(`user_id`),
    INDEX `fk_profile_meal_plan`(`assigned_meal_plan_id`),
    INDEX `fk_profile_workout_plan`(`assigned_workout_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `calories_consumed` INTEGER NULL DEFAULT 0,
    `workouts_completed` INTEGER NULL DEFAULT 0,
    `active_minutes` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `unique_user_date`(`user_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `display_name` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `theme` VARCHAR(20) NULL DEFAULT 'light',

    UNIQUE INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin', 'manager') NOT NULL DEFAULT 'user',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `support_conversations_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `sender_role` VARCHAR(20) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `support_messages_conversation_id_idx`(`conversation_id`),
    INDEX `support_messages_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_presence` (
    `user_id` INTEGER NOT NULL,
    `is_online` BOOLEAN NOT NULL DEFAULT false,
    `last_seen` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `workout_plan_id` INTEGER NULL,
    `duration_minutes` INTEGER NULL,
    `notes` TEXT NULL,
    `log_date` DATE NOT NULL,
    `workout_plan_day_id` INTEGER NULL,
    `workout_title` VARCHAR(100) NULL,
    `difficulty_rating` INTEGER NULL,

    INDEX `user_id`(`user_id`),
    INDEX `workout_plan_id`(`workout_plan_id`),
    INDEX `workout_plan_day_id`(`workout_plan_day_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_name` VARCHAR(150) NOT NULL,
    `fitness_goal` ENUM('weight_loss', 'muscle_gain', 'maintenance') NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATE NULL DEFAULT (curdate()),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workout_plan_id` INTEGER NOT NULL,
    `workout_title` VARCHAR(100) NULL,
    `day` ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,

    INDEX `workout_plan_id`(`workout_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_recommendations` ADD CONSTRAINT `ai_recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `daily_meal_plans` ADD CONSTRAINT `daily_meal_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `log_exercises` ADD CONSTRAINT `log_exercises_ibfk_1` FOREIGN KEY (`workout_log_id`) REFERENCES `workout_logs`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `log_exercises` ADD CONSTRAINT `log_exercises_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `log_sets` ADD CONSTRAINT `log_sets_ibfk_1` FOREIGN KEY (`log_exercise_id`) REFERENCES `log_exercises`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `meals` ADD CONSTRAINT `meals_ibfk_1` FOREIGN KEY (`daily_meal_plan_id`) REFERENCES `daily_meal_plans`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `meal_entries` ADD CONSTRAINT `meal_entries_ibfk_1` FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `meal_entries` ADD CONSTRAINT `meal_entries_ibfk_2` FOREIGN KEY (`food_item_id`) REFERENCES `food_items`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plan_exercises` ADD CONSTRAINT `plan_exercises_ibfk_1` FOREIGN KEY (`day_id`) REFERENCES `workout_plan_days`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plan_exercises` ADD CONSTRAINT `plan_exercises_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `fk_profile_meal_plan` FOREIGN KEY (`assigned_meal_plan_id`) REFERENCES `daily_meal_plans`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `fk_profile_workout_plan` FOREIGN KEY (`assigned_workout_plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `progress` ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `support_conversations` ADD CONSTRAINT `support_conversations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_messages` ADD CONSTRAINT `support_messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `support_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_messages` ADD CONSTRAINT `support_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_presence` ADD CONSTRAINT `user_presence_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_ibfk_2` FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_ibfk_3` FOREIGN KEY (`workout_plan_day_id`) REFERENCES `workout_plan_days`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_plan_days` ADD CONSTRAINT `workout_plan_days_ibfk_1` FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
