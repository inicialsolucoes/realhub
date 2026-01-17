const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
if (process.env.TIMEZONE) {
    process.env.TZ = process.env.TIMEZONE;
}

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const unitRoutes = require('./routes/units');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 uploads

// Routes
app.get('/', (req, res) => {
    res.send('AdminHub API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cost-centers', require('./routes/costCenters'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/activity-logs', require('./routes/activityLogs'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/reports', require('./routes/reports'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
