-- CreateTable
CREATE TABLE `ai_recommendations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `generated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `weight_assessment` TEXT NULL,
    `nutrition_assessment` TEXT NULL,
    `workout_assessment` TEXT NULL,
    `recommendations` JSON NOT NULL,

    INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `check_ins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `weight` FLOAT NOT NULL,
    `workouts_completed` INTEGER NOT NULL,
    `feedback` TEXT NULL,
    `check_in_date` DATETIME(0) NOT NULL,

    INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_meal_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_name` VARCHAR(150) NOT NULL,
    `target_calories` INTEGER NULL,
    `target_protein` INTEGER NULL,
    `is_active` BOOLEAN NULL DEFAULT true,

    INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `muscle_group` VARCHAR(50) NULL,
    `difficulty` ENUM('beginner', 'intermediate', 'advanced') NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `food_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `calories_per_100g` FLOAT NOT NULL,
    `protein_per_100g` FLOAT NULL,
    `carbs_per_100g` FLOAT NULL,
    `fat_per_100g` FLOAT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workout_log_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,

    INDEX `exercise_id`(`exercise_id` ASC),
    INDEX `workout_log_id`(`workout_log_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_sets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `log_exercise_id` INTEGER NOT NULL,
    `reps` INTEGER NOT NULL,
    `weight_kg` FLOAT NULL,

    INDEX `log_exercise_id`(`log_exercise_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meal_plan_id` INTEGER NOT NULL,
    `food_item_id` INTEGER NOT NULL,
    `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    `quantity_grams` FLOAT NOT NULL,
    `calories_total` INTEGER NULL,

    INDEX `food_item_id`(`food_item_id` ASC),
    INDEX `meal_plan_id`(`meal_plan_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_id` INTEGER NOT NULL,
    `exercise_id` INTEGER NOT NULL,
    `target_sets` INTEGER NULL,
    `target_reps` INTEGER NULL,
    `target_weight` FLOAT NULL,

    INDEX `day_id`(`day_id` ASC),
    INDEX `exercise_id`(`exercise_id` ASC),
    PRIMARY KEY (`id` ASC)
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

    INDEX `fk_profile_meal_plan`(`assigned_meal_plan_id` ASC),
    INDEX `fk_profile_workout_plan`(`assigned_workout_plan_id` ASC),
    UNIQUE INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `calories_consumed` INTEGER NULL DEFAULT 0,
    `workouts_completed` INTEGER NULL DEFAULT 0,
    `active_minutes` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `unique_user_date`(`user_id` ASC, `date` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin', 'manager') NOT NULL DEFAULT 'user',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `workout_plan_id` INTEGER NULL,
    `duration_minutes` INTEGER NULL,
    `notes` TEXT NULL,
    `log_date` DATE NOT NULL,

    INDEX `user_id`(`user_id` ASC),
    INDEX `workout_plan_id`(`workout_plan_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workout_plan_id` INTEGER NOT NULL,
    `day_number` INTEGER NOT NULL,
    `workout_title` VARCHAR(100) NULL,

    INDEX `workout_plan_id`(`workout_plan_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plan_name` VARCHAR(150) NOT NULL,
    `fitness_goal` ENUM('weight_loss', 'muscle_gain', 'maintenance') NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATE NULL DEFAULT (curdate()),

    INDEX `user_id`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
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
ALTER TABLE `meal_entries` ADD CONSTRAINT `meal_entries_ibfk_1` FOREIGN KEY (`meal_plan_id`) REFERENCES `daily_meal_plans`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

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
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_logs` ADD CONSTRAINT `workout_logs_ibfk_2` FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_plan_days` ADD CONSTRAINT `workout_plan_days_ibfk_1` FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

