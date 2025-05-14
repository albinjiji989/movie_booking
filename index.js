require('dotenv').config();
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const useragent = require('express-useragent');

// Routes
const RegLoginRoute = require('./routes/RegLoginRoute');
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');

// Cron Job - Update Inactive Schedules
require('./cronJobs');  // Import and start the cron job to mark schedules as inactive

const app = express();
const port = process.env.PORT || 4321;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true, limit: '150mb' }));
app.use(bodyParser.json({ limit: '150mb' }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(useragent.express());

// Log each request
app.use((req, res, next) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log("📩 Request URL:", fullUrl);
  next();
});

// Mount routes
app.use('/api/', RegLoginRoute);
app.use('/api/admin/', adminRoute);
app.use('/api/user/', userRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "🚫 Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Always use MongoDB Atlas from .env
const dbUri = process.env.MONGODB_URI;

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Graceful shutdown without callback (updated for latest Mongoose)
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err.message);
    process.exit(1);
  }
});

// Start Express server
app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});
