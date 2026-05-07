const workoutPlans = [
    {
        workoutPlanId: 1,
        userId: 1,
        name: "John Doe - 3 Day Muscle Gain Plan",
        goal: "muscle gain",
        isActive: true,
        days: [
            {
                day: "Sunday",
                title: "Full Body A",
                exercises: [
                    {
                        exerciseId: 1,
                        exerciseName: "Leg Press",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 80
                    },
                    {
                        exerciseId: 2,
                        exerciseName: "Chest Press",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 35
                    },
                    {
                        exerciseId: 3,
                        exerciseName: "Lat Pulldown",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 40
                    }
                ]
            },
            {
                day: "Tuesday",
                title: "Upper Body Focus",
                exercises: [
                    {
                        exerciseId: 4,
                        exerciseName: "Shoulder Press",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 12
                    },
                    {
                        exerciseId: 5,
                        exerciseName: "Biceps Curl",
                        targetSets: 3,
                        targetReps: 12,
                        targetWeight: 10
                    },
                    {
                        exerciseId: 6,
                        exerciseName: "Triceps Pushdown",
                        targetSets: 3,
                        targetReps: 12,
                        targetWeight: 25
                    }
                ]
            },
            {
                day: "Thursday",
                title: "Full Body B",
                exercises: [
                    {
                        exerciseId: 1,
                        exerciseName: "Leg Press",
                        targetSets: 4,
                        targetReps: 8,
                        targetWeight: 90
                    },
                    {
                        exerciseId: 3,
                        exerciseName: "Lat Pulldown",
                        targetSets: 3,
                        targetReps: 8,
                        targetWeight: 45
                    },
                    {
                        exerciseId: 7,
                        exerciseName: "Plank",
                        targetSets: 3,
                        targetReps: 45,
                        targetWeight: 0
                    }
                ]
            }
        ],
        createdAt: "2026-05-05"
    },
    {
        workoutPlanId: 2,
        userId: 3,
        name: "Dana Cohen - 3 Day Muscle Gain Plan",
        goal: "muscle gain",
        isActive: true,
        days: [
            {
                day: "Monday",
                title: "Lower Body And Core",
                exercises: [
                    {
                        exerciseId: 1,
                        exerciseName: "Leg Press",
                        targetSets: 3,
                        targetReps: 12,
                        targetWeight: 60
                    },
                    {
                        exerciseId: 7,
                        exerciseName: "Plank",
                        targetSets: 3,
                        targetReps: 40,
                        targetWeight: 0
                    }
                ]
            },
            {
                day: "Wednesday",
                title: "Upper Body Push",
                exercises: [
                    {
                        exerciseId: 2,
                        exerciseName: "Chest Press",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 25
                    },
                    {
                        exerciseId: 4,
                        exerciseName: "Shoulder Press",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 8
                    },
                    {
                        exerciseId: 6,
                        exerciseName: "Triceps Pushdown",
                        targetSets: 3,
                        targetReps: 12,
                        targetWeight: 18
                    }
                ]
            },
            {
                day: "Friday",
                title: "Upper Body Pull",
                exercises: [
                    {
                        exerciseId: 3,
                        exerciseName: "Lat Pulldown",
                        targetSets: 3,
                        targetReps: 10,
                        targetWeight: 30
                    },
                    {
                        exerciseId: 5,
                        exerciseName: "Biceps Curl",
                        targetSets: 3,
                        targetReps: 12,
                        targetWeight: 7
                    },
                    {
                        exerciseId: 7,
                        exerciseName: "Plank",
                        targetSets: 3,
                        targetReps: 45,
                        targetWeight: 0
                    }
                ]
            }
        ],
        createdAt: "2026-05-05"
    }
];

module.exports = workoutPlans;