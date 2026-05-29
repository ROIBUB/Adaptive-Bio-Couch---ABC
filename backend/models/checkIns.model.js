let checkIns = [
    { checkInId: 1, userId: 1, weight: 75.5, workoutsCompleted: 3, feedback: "Workouts went well. Feeling strong this week.",          checkInDate: "2026-05-12" },
    { checkInId: 2, userId: 3, weight: 60.3, workoutsCompleted: 3, feedback: "Followed the plan closely. Energy levels are good.",      checkInDate: "2026-05-12" },
    { checkInId: 3, userId: 6, weight: 84.2, workoutsCompleted: 2, feedback: "Had a tough week but managed most workouts.",             checkInDate: "2026-05-12" }
];

const getAll = () => checkIns;

const getById = (id) => checkIns.find(ci => ci.checkInId === id) || null;

const getByUserId = (userId) => checkIns.filter(ci => ci.userId === userId);

const create = (data) => {
    const newCheckIn = {
        checkInId: checkIns.length > 0 ? checkIns[checkIns.length - 1].checkInId + 1 : 1,
        userId: data.userId,
        weight: data.weight,
        workoutsCompleted: data.workoutsCompleted,
        feedback: data.feedback || "",
        checkInDate: data.checkInDate
    };
    checkIns.push(newCheckIn);
    return newCheckIn;
};

const update = (id, data) => {
    const index = checkIns.findIndex(ci => ci.checkInId === id);
    if (index === -1) return null;
    checkIns[index] = {
        checkInId: id,
        userId: checkIns[index].userId,
        weight: data.weight,
        workoutsCompleted: data.workoutsCompleted,
        feedback: data.feedback || "",
        checkInDate: data.checkInDate
    };
    return checkIns[index];
};

const remove = (id) => {
    const index = checkIns.findIndex(ci => ci.checkInId === id);
    if (index === -1) return null;
    return checkIns.splice(index, 1)[0];
};

module.exports = { getAll, getById, getByUserId, create, update, remove };
