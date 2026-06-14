//our server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./middleware/logger');
const authorize = require('./middleware/auth');
const usersRoutes = require('./routes/users.routes');
const exercisesRoutes = require('./routes/exercises.routes')
const foodItemsRoutes = require("./routes/foodItems.routes");
const workoutPlansRoutes = require("./routes/workoutPlans.routes");
const workoutLogsRoutes = require("./routes/workoutLogs.routes");
const dailyMealPlansRoutes = require("./routes/dailyMealPlans.routes");
const checkInsRoutes = require("./routes/checkIns.routes");
const authRoutes = require("./routes/auth.routes");
const settingsRoutes = require("./routes/settings.routes");
const profilesRoutes = require("./routes/profiles.routes");
const progressDataRoutes = require("./routes/progressData.routes");
const { initChatSocket } = require('./sockets/chat.socket');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

// Allow the React frontend (localhost:5173) to call this API
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-role, x-user-id, userid');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

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
// every request to /api/auth is sent to auth.routes.js
app.use("/api/auth", authRoutes);
// every request to /api/settings is sent to settings.routes.js
app.use("/api/settings", settingsRoutes);
// every request to /api/profiles is sent to profiles.routes.js
app.use("/api/profiles", profilesRoutes);
// every request to /api/progress is sent to progressData.routes.js
app.use("/api/progress", progressDataRoutes);

initChatSocket(io);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});