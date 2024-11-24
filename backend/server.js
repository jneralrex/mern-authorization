const express = require("express");
const userApiRoutes = require('./routes/user.routes')
const authRoutes = require('./routes/auth.routes.js')
const connectDb = require('./config/connectDb.js')
const app = express();
const config = require('./config/config.js');
const errorHandler = require("./utils/error.js");

const port = config.port;

connectDb();

app.use(express.json());
app.use('/api/user', userApiRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error('Error caught by errorHandler:', err);

  if (err.code === 'ENOTFOUND' || (err.message && err.message.includes('ECONNRESET'))) {
    return res.status(500).json({
      success: false,
      message: 'Check your internet connection and try again',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode
  });
});

app.listen(port, () => {
  console.log("Server listening on port 3000");
});
