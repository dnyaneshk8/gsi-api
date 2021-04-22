const jwt = require("jsonwebtoken");
import { LeanDocument } from "mongoose";
import { IUser } from "../models/Auth.model";
let lib = {};

export default {
  /** Creates a token JWT token
   * @param userDetails
   * @param callback Error first callback function
   */
  createToken: function (userDetails: IUser | LeanDocument<IUser>) {
    return new Promise((resolve, reject) => {
      if (typeof userDetails === "object") {
        let { name, email } = userDetails;
        let token = jwt.sign({ data: { email, name } }, process.env.SECRET, {
          expiresIn: "72h",
        });
        if (token) {
          resolve(token);
          return;
        } else {
          reject("Could not create token");
          return;
        }
      } else {
        reject("User details are not valid, expecting a user object");
        return;
      }
    });
  },

  /** Verify a token
   * @param token
   * @param callback Error first callback function
   * @returns user object
   */
  verifyToken: function (token: string): Promise<{ data: any } | false> {
    return new Promise((resolve, reject) => {
      if (typeof token === "string" && token.length) {
        jwt.verify(
          token,
          process.env.SECRET,
          function (err: any, decoded: any) {
            if (!err) {
              resolve(decoded);
            } else {
              resolve(false);
            }
          }
        );
      } else {
        resolve(false);
      }
    });
  },
};
