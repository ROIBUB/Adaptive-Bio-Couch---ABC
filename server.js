//our server
const express = require('express');
const logger = require('./middleware/logger');
const authorize = require('./middleware/auth');
const usersRoutes = require('./routes/users.routes');
const exercisesRoutes = require('./routes/exercises.routes')
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



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});