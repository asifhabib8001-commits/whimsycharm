require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`WhimsyCharm API running on http://localhost:${PORT}`));
