import mongoose, { Document, Model, model, NativeError } from "mongoose";
import { LeanDocument } from "mongoose";
import { createHash } from "../utils/hepler";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
}
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
  },
  { timestamps: { createdAt: "created_at" } }
);

UserSchema.pre("save", function (next) {
  let user: any = this;

  return createHash(user.password, function (err, hash) {
    if (!err) {
      user.password = hash;
      return next();
    } else {
      return next(new NativeError());
    }
  });
});

export const User: Model<IUser> = model("user", UserSchema);
