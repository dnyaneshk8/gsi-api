import { Schema } from "mongoose";

var mongoose = require("mongoose");
export const uniqueValidtor = (schema: Schema, field: string) => async (
  value: any
) => {
  const count = await mongoose.model(schema).countDocuments({ [field]: value });
  return !count;
};
