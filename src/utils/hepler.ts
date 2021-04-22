var bcrypt = require("bcryptjs");

export const createHash = function (
  plainText: string,
  callback: (err: string, hash?: string) => void
) {
  if (typeof plainText === "string") {
    bcrypt.genSalt(
      Number(process.env.SALT_ROUNDS) || 10,
      function (err: any, salt: string) {
        bcrypt.hash(plainText, salt, function (err: any, hash: string) {
          callback(null, hash);
        });
      }
    );
  } else {
    callback("Invalid string");
  }
};

export const compareHash = function (plainText: string, hash: string) {
  return new Promise((resolve) => {
    bcrypt.compare(plainText, hash, function (err: any, res: any) {
      if (!err && res) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * max);
};
