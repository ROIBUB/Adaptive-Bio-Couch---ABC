require('dotenv').config();
const { analyzeProgress } = require('./services/aiAnalysisService');

// Use a user ID that already has at least one check-in in the DB
analyzeProgress(2)
    .then(result => {
        console.log('✅ Success:');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
    });