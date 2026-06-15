const prisma = require('../prisma/prismaClient');

const mapExercise = (e) => ({
    exerciseId: e.id,
    name: e.name,
    muscleGroup: e.muscle_group,
    difficultyLevel: e.difficulty,
    equipment: e.equipment,
    description: e.description
});

const getAll = async () => {
    const exercises = await prisma.exercise.findMany();
    return exercises.map(mapExercise);
};

const getById = async (id) => {
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    return exercise ? mapExercise(exercise) : null;
};

const create = async (data) => {
    const created = await prisma.exercise.create({
        data: {
            name: data.name,
            muscle_group: data.muscleGroup,
            difficulty: data.difficultyLevel,
            equipment: data.equipment || "",
            description: data.description || ""
        }
    });
    return mapExercise(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.exercise.update({
            where: { id },
            data: {
                name: data.name,
                muscle_group: data.muscleGroup,
                difficulty: data.difficultyLevel,
                equipment: data.equipment || "",
                description: data.description || ""
            }
        });
        return mapExercise(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const remove = async (id) => {
    try {
        const deleted = await prisma.exercise.delete({ where: { id } });
        return mapExercise(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = { getAll, getById, create, update, remove };
