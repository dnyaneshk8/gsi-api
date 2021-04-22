import mongoose, { Document, Model, model, Schema } from "mongoose";
// import { ILog } from "../api/logs/Log.model";
import { ILog } from "./Log.model";

export interface IGame extends Document {
  player: Schema.Types.ObjectId;
  logs: ILog[];
  playerHealth: number;
  dragonHealth: number;
  status: Boolean;
}
const GameSchema = new mongoose.Schema(
  {
    player: { type: Schema.Types.ObjectId, ref: "user" },
    logs: {
      type: [{ type: Schema.Types.ObjectId, ref: "log" }],
      autoPopulate: true,
    },
    playerHealth: { type: Number, required: true, default: 100, min: 0 },
    dragonHealth: { type: Number, required: true, default: 100, min: 0 },
    status: { type: Boolean, required: true, default: true },
    wonBy: {
      type: String,
      enum: ["Player", "Dragon"],
      default: undefined,
      nullable: true,
      min: 0,
    },
  },
  { timestamps: { createdAt: "created_at" } }
);

export const Game: Model<IGame> = model("game", GameSchema);
