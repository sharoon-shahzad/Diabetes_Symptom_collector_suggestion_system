import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    disease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      required: true,
    },
  },
  { timestamps: true }
);

export const Symptom = mongoose.model("Symptom", symptomSchema);
