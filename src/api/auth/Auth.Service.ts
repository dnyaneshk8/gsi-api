import mongoose, { LeanDocument, Model, SchemaType } from "mongoose";
import { IUser } from "../../models/Auth.model";

export class UserService {
  private collection = "user";
  private model: Model<IUser>;

  constructor() {
    this.model = mongoose.model(this.collection);
  }

  /**
   * Store user to DB
   * @param data Object with user details
   */
  async store(data: Object): Promise<LeanDocument<IUser | {}>> {
    return new Promise(async (resolve, reject) => {
      try {
        const User = new this.model(data);
        console.log("User is", User);
        const user: LeanDocument<IUser> = await User.save();
        console.log("stored", user);
        resolve(JSON.parse(JSON.stringify(user)));
      } catch (e) {
        console.log("Error", e);
        reject(e);
      }
    });
  }

  /**
   * Find User by email
   * @param email
   */
  findByEmail(email: string): Promise<LeanDocument<IUser>> {
    return new Promise(async (resolve, reject) => {
      try {
        if (email && typeof email === "string") {
          const user: IUser = await this.model.findOne({ email }).exec();
          if (user) {
            return resolve(user.toObject());
          }
          reject({ message: "Could not find user with this email" });
        } else {
          reject("Email ID invalid");
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
