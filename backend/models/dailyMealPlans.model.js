const dailyMealPlans = [
    {
        dailyMealPlanId: 1,
        userId: 1,
        name: "John Doe - Muscle Gain Daily Meal Plan",
        goal: "muscle gain",
        targetCalories: 2800,
        targetProtein: 150,
        isActive: true,
        meals: [
            {
                mealType: "Breakfast",
                title: "Greek Yogurt With Oats",
                estimatedCalories: 550,
                estimatedProtein: 35,
                foodItems: [
                    {
                        foodItemId: 2,
                        foodName: "Greek Yogurt",
                        quantityGrams: 250
                    },
                    {
                        foodItemId: 6,
                        foodName: "Oats",
                        quantityGrams: 60
                    }
                ]
            },
            {
                mealType: "Lunch",
                title: "Chicken Breast With Rice",
                estimatedCalories: 750,
                estimatedProtein: 55,
                foodItems: [
                    {
                        foodItemId: 1,
                        foodName: "Chicken Breast",
                        quantityGrams: 180
                    },
                    {
                        foodItemId: 3,
                        foodName: "White Rice",
                        quantityGrams: 250
                    }
                ]
            },
            {
                mealType: "Dinner",
                title: "Salmon With Sweet Potato",
                estimatedCalories: 800,
                estimatedProtein: 45,
                foodItems: [
                    {
                        foodItemId: 4,
                        foodName: "Salmon",
                        quantityGrams: 180
                    },
                    {
                        foodItemId: 8,
                        foodName: "Sweet Potato",
                        quantityGrams: 250
                    }
                ]
            },
            {
                mealType: "Snack",
                title: "Cottage Cheese And Egg",
                estimatedCalories: 350,
                estimatedProtein: 30,
                foodItems: [
                    {
                        foodItemId: 9,
                        foodName: "Cottage Cheese",
                        quantityGrams: 200
                    },
                    {
                        foodItemId: 5,
                        foodName: "Egg",
                        quantityGrams: 50
                    }
                ]
            }
        ],
        createdAt: "2026-05-05"
    },
    {
        dailyMealPlanId: 2,
        userId: 3,
        name: "Dana Cohen - Muscle Gain Daily Meal Plan",
        goal: "muscle gain",
        targetCalories: 2300,
        targetProtein: 120,
        isActive: true,
        meals: [
            {
                mealType: "Breakfast",
                title: "Greek Yogurt Bowl",
                estimatedCalories: 450,
                estimatedProtein: 30,
                foodItems: [
                    {
                        foodItemId: 2,
                        foodName: "Greek Yogurt",
                        quantityGrams: 220
                    },
                    {
                        foodItemId: 6,
                        foodName: "Oats",
                        quantityGrams: 45
                    }
                ]
            },
            {
                mealType: "Lunch",
                title: "Chicken Rice Bowl",
                estimatedCalories: 650,
                estimatedProtein: 45,
                foodItems: [
                    {
                        foodItemId: 1,
                        foodName: "Chicken Breast",
                        quantityGrams: 150
                    },
                    {
                        foodItemId: 3,
                        foodName: "White Rice",
                        quantityGrams: 220
                    },
                    {
                        foodItemId: 10,
                        foodName: "Broccoli",
                        quantityGrams: 150
                    }
                ]
            },
            {
                mealType: "Dinner",
                title: "Eggs With Sweet Potato",
                estimatedCalories: 600,
                estimatedProtein: 35,
                foodItems: [
                    {
                        foodItemId: 5,
                        foodName: "Egg",
                        quantityGrams: 100
                    },
                    {
                        foodItemId: 8,
                        foodName: "Sweet Potato",
                        quantityGrams: 250
                    },
                    {
                        foodItemId: 10,
                        foodName: "Broccoli",
                        quantityGrams: 150
                    }
                ]
            },
            {
                mealType: "Snack",
                title: "Cottage Cheese Snack",
                estimatedCalories: 300,
                estimatedProtein: 25,
                foodItems: [
                    {
                        foodItemId: 9,
                        foodName: "Cottage Cheese",
                        quantityGrams: 200
                    }
                ]
            }
        ],
        createdAt: "2026-05-05"
    }
];

module.exports = dailyMealPlans;