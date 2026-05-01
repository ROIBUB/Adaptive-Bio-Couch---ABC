const express = require('express');
const logger = require('./middleware/logger');
const authorize = require('./middleware/auth');
const profilesRoutes = require('./routes/profiles.routes');
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
app.use('/api/profiles', profilesRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});