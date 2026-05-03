//our server
const express = require('express');
const logger = require('./middleware/logger');
const authorize = require('./middleware/auth');
const usersRoutes = require('./routes/users.routes');
const app = express();
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


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});