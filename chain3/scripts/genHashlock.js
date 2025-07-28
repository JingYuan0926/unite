const crypto = require("crypto");

const secret = crypto.randomBytes(32).toString("hex");
const hashlock = crypto
  .createHash("sha256")
  .update(Buffer.from(secret, "hex"))
  .digest("hex");

console.log("Secret:", secret);
console.log("Hashlock:", hashlock);
