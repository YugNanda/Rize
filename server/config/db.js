const mongoose = require('mongoose');

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 7000,
    };
    cachedPromise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}`);
      return m.connection;
    }).catch((err) => {
      cachedPromise = null;
      console.error('MongoDB connection error:', err.message);
      throw err;
    });
  }

  return cachedPromise;
};

module.exports = connectDB;
