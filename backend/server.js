require("dotenv").config();
const express = require("express");
const userApiRoutes = require('./routes/user.routes')
const authRoutes = require('./routes/auth.routes.js')
const mongoose = require('mongoose')
const app = express();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Could not connect", err);
  });

app.use(express.json());
app.use('/api/user', userApiRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next)=>{
  const statusCode = err.statuscode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode
  });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
