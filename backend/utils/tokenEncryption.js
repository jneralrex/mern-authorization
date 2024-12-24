const crypto = require("crypto");

const encryptToken = (token) => {
  const algorithm = "aes-256-ctr";
  const secretKey = process.env.REFRESH_TOKEN_SECRET;
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(token), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptToken = (hash) => {
  const [iv, encryptedToken] = hash.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    process.env.REFRESH_TOKEN_SECRET,
    Buffer.from(iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedToken, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};

module.exports = {
  encryptToken,
  decryptToken,
};
