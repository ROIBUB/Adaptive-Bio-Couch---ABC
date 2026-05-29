let users = [
    { userid: 1, firstName: 'John',  lastName: 'Doe',       email: 'john@fitwize.com',  password: 'password123', createDate: new Date(), updateDate: new Date(), userRole: 'user',    age: 25, gender: 'male',   height: 175, weight: 75, activityLevel: 'intermediate', fitnessGoal: 'muscle_gain',  preferences: 5 },
    { userid: 2, firstName: 'Noam',  lastName: 'Levi',      email: 'noam@fitwize.com',  password: 'password123', createDate: new Date(), updateDate: new Date(), userRole: 'admin',   age: 28, gender: 'male',   height: 180, weight: 82, activityLevel: 'advanced',     fitnessGoal: 'weight_loss',  preferences: 4 },
    { userid: 3, firstName: 'Dana',  lastName: 'Cohen',     email: 'dana@fitwize.com',  password: 'password123', createDate: new Date(), updateDate: new Date(), userRole: 'user',    age: 24, gender: 'female', height: 165, weight: 60, activityLevel: 'intermediate', fitnessGoal: 'muscle_gain',  preferences: 5 },
    { userid: 4, firstName: 'Yossi', lastName: 'Mizrahi',   email: 'yossi@fitwize.com', password: 'password123', createDate: new Date(), updateDate: new Date(), userRole: 'manager', age: 35, gender: 'male',   height: 175, weight: 90, activityLevel: 'beginner',     fitnessGoal: 'weight_loss',  preferences: 3 },
    { userid: 5, firstName: 'Maya',  lastName: 'Ben-David', email: 'maya@fitwize.com',  password: 'password123', createDate: new Date(), updateDate: new Date(), userRole: 'user',    age: 22, gender: 'female', height: 170, weight: 58, activityLevel: 'advanced',     fitnessGoal: 'maintenance',  preferences: 4 },
    { userid: 6, firstName: 'Eitan', lastName: 'Katz',      email: 'eitan@fitwize.com', password: 'password123', createDate: new Date(), updateDate: new Date(), userRole: 'user',    age: 30, gender: 'male',   height: 178, weight: 85, activityLevel: 'beginner',     fitnessGoal: 'weight_loss',  preferences: 3 }
];

const getAll = () => users;

const getById = (id) => users.find(u => u.userid === id) || null;

const findByEmail = (email) => users.find(u => u.email === email) || null;

const create = (data) => {
    const newUser = {
        userid: users.length > 0 ? users[users.length - 1].userid + 1 : 1,
        ...data,
        createDate: new Date(),
        updateDate: new Date()
    };
    users.push(newUser);
    return newUser;
};

const update = (id, data) => {
    const index = users.findIndex(u => u.userid === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data, updateDate: new Date() };
    return users[index];
};

const remove = (id) => {
    const index = users.findIndex(u => u.userid === id);
    if (index === -1) return null;
    return users.splice(index, 1)[0];
};

module.exports = { getAll, getById, findByEmail, create, update, remove };
