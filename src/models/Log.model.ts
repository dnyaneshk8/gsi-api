import mongoose, { Document, Model, model, Schema } from "mongoose";

export interface ILog extends Document {
  log: string;
  game: { type: Schema.Types.ObjectId };
  user: { type: Schema.Types.ObjectId };
}
const LogSchema = new mongoose.Schema(
  {
    log: { type: String, require: true },
    game: { type: Schema.Types.ObjectId, ref: "game" },
    user: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: { createdAt: "created_at" } }
);

export const Log: Model<ILog> = model("log", LogSchema);
