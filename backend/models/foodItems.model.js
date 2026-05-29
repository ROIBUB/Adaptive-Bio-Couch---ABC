let foodItems = [
    { foodItemId: 1,  name: "Chicken Breast",  category: "protein",   caloriesPer100g: 165, proteinPer100g: 31,   carbsPer100g:  0,   fatPer100g:  3.6 },
    { foodItemId: 2,  name: "Greek Yogurt",    category: "dairy",     caloriesPer100g:  59, proteinPer100g: 10,   carbsPer100g:  3.6, fatPer100g:  0.4 },
    { foodItemId: 3,  name: "White Rice",      category: "carb",      caloriesPer100g: 130, proteinPer100g:  2.7, carbsPer100g: 28,   fatPer100g:  0.3 },
    { foodItemId: 4,  name: "Salmon",          category: "protein",   caloriesPer100g: 208, proteinPer100g: 20,   carbsPer100g:  0,   fatPer100g: 13   },
    { foodItemId: 5,  name: "Egg",             category: "protein",   caloriesPer100g: 155, proteinPer100g: 13,   carbsPer100g:  1.1, fatPer100g: 11   },
    { foodItemId: 6,  name: "Oats",            category: "carb",      caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g:  6.9 },
    { foodItemId: 7,  name: "Avocado",         category: "fat",       caloriesPer100g: 160, proteinPer100g:  2,   carbsPer100g:  8.5, fatPer100g: 14.7 },
    { foodItemId: 8,  name: "Sweet Potato",    category: "carb",      caloriesPer100g:  86, proteinPer100g:  1.6, carbsPer100g: 20,   fatPer100g:  0.1 },
    { foodItemId: 9,  name: "Cottage Cheese",  category: "dairy",     caloriesPer100g:  98, proteinPer100g: 11,   carbsPer100g:  3.4, fatPer100g:  4.3 },
    { foodItemId: 10, name: "Broccoli",        category: "vegetable", caloriesPer100g:  34, proteinPer100g:  2.8, carbsPer100g:  6.6, fatPer100g:  0.4 }
];

const getAll = () => foodItems;

const getById = (id) => foodItems.find(item => item.foodItemId === id) || null;

const create = (data) => {
    const newItem = {
        foodItemId: foodItems.length > 0 ? foodItems[foodItems.length - 1].foodItemId + 1 : 1,
        name: data.name,
        category: data.category,
        caloriesPer100g: data.caloriesPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g
    };
    foodItems.push(newItem);
    return newItem;
};

const update = (id, data) => {
    const index = foodItems.findIndex(item => item.foodItemId === id);
    if (index === -1) return null;
    foodItems[index] = {
        foodItemId: id,
        name: data.name,
        category: data.category,
        caloriesPer100g: data.caloriesPer100g,
        proteinPer100g: data.proteinPer100g,
        carbsPer100g: data.carbsPer100g,
        fatPer100g: data.fatPer100g
    };
    return foodItems[index];
};

const remove = (id) => {
    const index = foodItems.findIndex(item => item.foodItemId === id);
    if (index === -1) return null;
    return foodItems.splice(index, 1)[0];
};

module.exports = { getAll, getById, create, update, remove };
