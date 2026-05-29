let exercises = [
    { exerciseId: 1, name: "Leg Press",       muscleGroup: "Legs",      difficultyLevel: "Beginner",     equipment: "Machine",       description: "A lower-body exercise that mainly targets the quadriceps, glutes, and hamstrings." },
    { exerciseId: 2, name: "Chest Press",     muscleGroup: "Chest",     difficultyLevel: "Beginner",     equipment: "Machine",       description: "An upper-body pushing exercise that mainly targets the chest muscles." },
    { exerciseId: 3, name: "Lat Pulldown",    muscleGroup: "Back",      difficultyLevel: "Beginner",     equipment: "Machine",       description: "An upper-body pulling exercise that mainly targets the back muscles, especially the lats." },
    { exerciseId: 4, name: "Shoulder Press",  muscleGroup: "Shoulders", difficultyLevel: "Intermediate", equipment: "Dumbbells",     description: "An upper-body pushing exercise that mainly targets the shoulder muscles." },
    { exerciseId: 5, name: "Biceps Curl",     muscleGroup: "Biceps",    difficultyLevel: "Beginner",     equipment: "Dumbbells",     description: "An isolation exercise that targets the front upper-arm muscles." },
    { exerciseId: 6, name: "Triceps Pushdown",muscleGroup: "Triceps",   difficultyLevel: "Beginner",     equipment: "Cable Machine", description: "An isolation exercise that targets the back upper-arm muscles." },
    { exerciseId: 7, name: "Plank",           muscleGroup: "Core",      difficultyLevel: "Beginner",     equipment: "Bodyweight",    description: "A core stability exercise that strengthens the abdominal and trunk muscles." }
];

const getAll = () => exercises;

const getById = (id) => exercises.find(e => e.exerciseId === id) || null;

const create = (data) => {
    const newExercise = {
        exerciseId: exercises.length > 0 ? exercises[exercises.length - 1].exerciseId + 1 : 1,
        name: data.name,
        muscleGroup: data.muscleGroup,
        difficultyLevel: data.difficultyLevel,
        equipment: data.equipment || "",
        description: data.description || ""
    };
    exercises.push(newExercise);
    return newExercise;
};

const update = (id, data) => {
    const index = exercises.findIndex(e => e.exerciseId === id);
    if (index === -1) return null;
    exercises[index] = {
        exerciseId: id,
        name: data.name,
        muscleGroup: data.muscleGroup,
        difficultyLevel: data.difficultyLevel,
        equipment: data.equipment || "",
        description: data.description || ""
    };
    return exercises[index];
};

const remove = (id) => {
    const index = exercises.findIndex(e => e.exerciseId === id);
    if (index === -1) return null;
    return exercises.splice(index, 1)[0];
};

module.exports = { getAll, getById, create, update, remove };
