const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Trip creator
  title: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, default: 0 },

  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      contributed: { type: Number, default: 0 },
      owes: { type: Number, default: 0 },
    },
  ],

  invitations: [
    {
      email: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    },
  ],

  expenses: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true },
      paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  ],

  status: {
    type: String,
    enum: ["upcoming", "in-progress", "completed", "canceled"],
    default: "upcoming",
  },
  
}, { timestamps: true });

module.exports = mongoose.model("Trip", TripSchema);
