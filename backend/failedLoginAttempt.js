let failedLoginAttempts = {};

const loginAttemptDelay = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const delay = 1000; // 1-second delay for each failed attempt

  if (failedLoginAttempts[ip] && failedLoginAttempts[ip] > now) {
    const waitTime = (failedLoginAttempts[ip] - now) / 1000;
    return res
      .status(429)
      .json({ message: `Too many attempts. Try again in ${waitTime}s` });
  }

if (successfulLogin) {
  delete failedLoginAttempts[ip];
} else {
  failedLoginAttempts[ip] = Date.now() + delay;
}

  next();
};

module.exports = loginAttemptDelay;