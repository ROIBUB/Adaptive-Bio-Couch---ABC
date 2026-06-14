const prisma = require('../prisma/prismaClient');

const mapFoodItem = (f) => ({
    foodItemId: f.id,
    name: f.name,
    category: f.category,
    caloriesPer100g: f.calories_per_100g,
    proteinPer100g: f.protein_per_100g,
    carbsPer100g: f.carbs_per_100g,
    fatPer100g: f.fat_per_100g
});

const getAll = async () => {
    const items = await prisma.foodItem.findMany();
    return items.map(mapFoodItem);
};

const getById = async (id) => {
    const item = await prisma.foodItem.findUnique({ where: { id } });
    return item ? mapFoodItem(item) : null;
};

const create = async (data) => {
    const created = await prisma.foodItem.create({
        data: {
            name: data.name,
            category: data.category,
            calories_per_100g: data.caloriesPer100g,
            protein_per_100g: data.proteinPer100g,
            carbs_per_100g: data.carbsPer100g,
            fat_per_100g: data.fatPer100g
        }
    });
    return mapFoodItem(created);
};

const update = async (id, data) => {
    try {
        const updated = await prisma.foodItem.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                calories_per_100g: data.caloriesPer100g,
                protein_per_100g: data.proteinPer100g,
                carbs_per_100g: data.carbsPer100g,
                fat_per_100g: data.fatPer100g
            }
        });
        return mapFoodItem(updated);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

const remove = async (id) => {
    try {
        const deleted = await prisma.foodItem.delete({ where: { id } });
        return mapFoodItem(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = { getAll, getById, create, update, remove };
