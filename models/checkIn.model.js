const checkIns = [
    {
        checkInId: 1,
        userId: 1,
        date: "2026-05-12",
        currentWeight: 75.5,
        nutritionDeviation: "small",
        deviationFrequency: 2,
        hungerLevel: "medium",
        energyLevel: "high",
        generalFeedback: "Workouts went well. Had two small nutrition deviations during the weekend.",
        recommendationSummary: "Keep the daily meal plan unchanged and slightly increase workout weights next week."
    },
    {
        checkInId: 2,
        userId: 3,
        date: "2026-05-12",
        currentWeight: 60.3,
        nutritionDeviation: "none",
        deviationFrequency: 0,
        hungerLevel: "low",
        energyLevel: "medium",
        generalFeedback: "Completed most workouts and followed the meal plan closely.",
        recommendationSummary: "Keep the current meal plan and continue progressing gradually in workouts."
    },
    {
        checkInId: 3,
        userId: 6,
        date: "2026-05-12",
        currentWeight: 84.2,
        nutritionDeviation: "moderate",
        deviationFrequency: 3,
        hungerLevel: "high",
        energyLevel: "low",
        generalFeedback: "Had several nutrition deviations and felt hungry during the week.",
        recommendationSummary: "Adjust the meal plan to include more filling meals and keep workout intensity moderate."
    }
];

module.exports = checkIns;