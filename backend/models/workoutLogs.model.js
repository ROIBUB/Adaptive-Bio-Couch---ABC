const workoutLogs = [
    {
        workoutLogId: 1,
        userId: 1,
        workoutPlanId: 1,
        date: "2026-05-06",
        workoutTitle: "Full Body A",
        exercises: [
            {
                exerciseId: 1,
                exerciseName: "Leg Press",
                sets: [
                    {
                        setNumber: 1,
                        reps: 10,
                        weight: 80
                    },
                    {
                        setNumber: 2,
                        reps: 10,
                        weight: 80
                    },
                    {
                        setNumber: 3,
                        reps: 9,
                        weight: 80
                    }
                ]
            },
            {
                exerciseId: 2,
                exerciseName: "Chest Press",
                sets: [
                    {
                        setNumber: 1,
                        reps: 10,
                        weight: 35
                    },
                    {
                        setNumber: 2,
                        reps: 10,
                        weight: 35
                    },
                    {
                        setNumber: 3,
                        reps: 8,
                        weight: 35
                    }
                ]
            },
            {
                exerciseId: 3,
                exerciseName: "Lat Pulldown",
                sets: [
                    {
                        setNumber: 1,
                        reps: 10,
                        weight: 40
                    },
                    {
                        setNumber: 2,
                        reps: 9,
                        weight: 40
                    },
                    {
                        setNumber: 3,
                        reps: 8,
                        weight: 40
                    }
                ]
            }
        ],
        durationMinutes: 60,
        difficultyRating: 8,
        notes: "Good workout, leg press felt challenging."
    },
    {
        workoutLogId: 2,
        userId: 1,
        workoutPlanId: 1,
        date: "2026-05-08",
        workoutTitle: "Upper Body Focus",
        exercises: [
            {
                exerciseId: 4,
                exerciseName: "Shoulder Press",
                sets: [
                    {
                        setNumber: 1,
                        reps: 10,
                        weight: 12
                    },
                    {
                        setNumber: 2,
                        reps: 9,
                        weight: 12
                    },
                    {
                        setNumber: 3,
                        reps: 8,
                        weight: 12
                    }
                ]
            },
            {
                exerciseId: 5,
                exerciseName: "Biceps Curl",
                sets: [
                    {
                        setNumber: 1,
                        reps: 12,
                        weight: 10
                    },
                    {
                        setNumber: 2,
                        reps: 11,
                        weight: 10
                    },
                    {
                        setNumber: 3,
                        reps: 10,
                        weight: 10
                    }
                ]
            },
            {
                exerciseId: 6,
                exerciseName: "Triceps Pushdown",
                sets: [
                    {
                        setNumber: 1,
                        reps: 12,
                        weight: 25
                    },
                    {
                        setNumber: 2,
                        reps: 12,
                        weight: 25
                    },
                    {
                        setNumber: 3,
                        reps: 10,
                        weight: 25
                    }
                ]
            }
        ],
        durationMinutes: 55,
        difficultyRating: 7,
        notes: "Shoulder press was difficult in the last set."
    },
    {
        workoutLogId: 3,
        userId: 3,
        workoutPlanId: 2,
        date: "2026-05-07",
        workoutTitle: "Lower Body And Core",
        exercises: [
            {
                exerciseId: 1,
                exerciseName: "Leg Press",
                sets: [
                    {
                        setNumber: 1,
                        reps: 12,
                        weight: 60
                    },
                    {
                        setNumber: 2,
                        reps: 12,
                        weight: 60
                    },
                    {
                        setNumber: 3,
                        reps: 12,
                        weight: 60
                    }
                ]
            },
            {
                exerciseId: 7,
                exerciseName: "Plank",
                sets: [
                    {
                        setNumber: 1,
                        reps: 40,
                        weight: 0
                    },
                    {
                        setNumber: 2,
                        reps: 35,
                        weight: 0
                    },
                    {
                        setNumber: 3,
                        reps: 30,
                        weight: 0
                    }
                ]
            }
        ],
        durationMinutes: 45,
        difficultyRating: 6,
        notes: "Completed all planned leg press sets."
    }
];

module.exports = workoutLogs;