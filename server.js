//our server
const express = require('express');
const logger = require('./middleware/logger');
const authorize = require('./middleware/auth');
const usersRoutes = require('./routes/users.routes');
const exercisesRoutes = require('./routes/exercises.routes')
const foodItemsRoutes = require("./routes/foodItems.routes");
const workoutPlansRoutes = require("./routes/workoutPlans.routes");
const workoutLogsRoutes = require("./routes/workoutLogs.routes");
const dailyMealPlansRoutes = require("./routes/dailyMealPlans.routes");
const checkInsRoutes = require("./routes/checkIns.routes");
const app = express();
// to let the server get JSON and use it through req.body
app.use(express.json())
app.use(logger);
const port = 3000;

app.get('/', authorize(['admin']), (req, res) => {
    res.json({
        success: true,
        data: "Hello Admin!",
        error: null
    });
});
// every request to /api/users is sent to users.routes.js
app.use('/api/users', usersRoutes);
// every request to /api/exercises is sent to exercises.routes.js
app.use('/api/exercises', exercisesRoutes);
// every request to /api/food-items is sent to foodIems.routes.js
app.use("/api/food-items", foodItemsRoutes);
// every request to /api/workout-plans is sent to workoutPlans.routes.js
app.use("/api/workout-plans", workoutPlansRoutes);
// every request to /api/workout-logs is sent to workoutLogs.routes.js
app.use("/api/workout-logs", workoutLogsRoutes);
// every request to /api/daily-meal-plans is sent to dailyMealPlans.routes.js
app.use("/api/daily-meal-plans", dailyMealPlansRoutes);
// every request to /api/check-ins is sent to checkIns.routes.js
app.use("/api/check-ins", checkInsRoutes);


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});