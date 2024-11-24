const mongoose = require('mongoose');
const config = require('./config.js');

const connectDB = async () => {
    try {
      await mongoose.connect(config.db_connect);
      console.log('MongoDB connected');
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.message.includes('ECONNRESET')) {
        console.error('Unable to connect to MongoDB. Check your internet connection and try again.');
        process.exit(1);
      } else {
        console.error('MongoDB connection error:', error);
        process.exit(1);
      }
    }
  };
  module.exports = connectDB;