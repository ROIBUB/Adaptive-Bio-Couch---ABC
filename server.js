const express = require('express');
const logger = require('./middleware/logger');

const app = express();
app.use(logger);

const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});