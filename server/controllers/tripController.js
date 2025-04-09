const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Trip = require("../models/Trip.js");
const sendEmail = require("../utils/sendEmail");
const path = require("path");
const dotenv = require("dotenv");
const User = require("../models/User");

exports.createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, budget, participants } = req.body;
    const userId = req.user.id;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const creatorParticipant = {
      userId,
      name: user.firstName,
      email: user.email,
      contributed: 0,
      owes: 0,
    };

    // Create the trip with only the creator in the participants
    const newTrip = new Trip({
      user: userId,
      title,
      destination,
      startDate,
      endDate,
      budget,
      participants: [creatorParticipant],
      invitations: [],
      expenses: [],
    });

    await newTrip.save();

    for (let p of participants) {
      const existingUser = await User.findOne({ email: p.email });

      if (existingUser) {
        newTrip.invitations.push({
          email: existingUser.email,
          userId: existingUser._id,
          status: "pending",
        });

        const acceptLink = `https://neotrack.com/trips/${newTrip._id}/accept`;

        await sendEmail(
          existingUser.email,
          `Trip Invitation: ${title}`,
          `You have been invited to join the trip "${title}" to ${destination}.`, // plain fallback
          path.join(__dirname, "../html/trips/tripInvite.html"),
          {
            firstName: existingUser.firstName,
            title,
            destination,
            acceptLink,
          }
        );
      } else {
        newTrip.invitations.push({
          email: p.email,
          status: "pending",
        });

        const registerLink = `https://neotrack.com/register`;

        await sendEmail(
          p.email,
          `Join NeoTrack to Accept Trip Invitation`,
          `You've been invited to join the trip "${title}" to ${destination}. Please register to accept.`,
          path.join(__dirname, "../html/trips/tripInviteRegister.html"),
          {
            title,
            destination,
            registerLink,
          }
        );
      }
    }

    await newTrip.save();

    res.status(201).json({ success: true, message: "Trip created successfully!", trip: newTrip });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { tripId, description, amount, paidBy, splitAmong } = req.body;

    if (!tripId || !description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    const payer = trip.participants.find(p => p.userId.toString() === paidBy);
    if (!payer) {
      return res.status(400).json({ success: false, message: "Payer is not a part of this trip." });
    }

    trip.expenses.push({ description, amount, paidBy, splitAmong });

    const splitAmount = parseFloat((amount / splitAmong.length).toFixed(2));

    trip.participants.forEach((participant) => {
      if (splitAmong.includes(participant.userId.toString())) {
        participant.owes += splitAmount;
      }
      if (participant.userId.toString() === paidBy) {
        participant.contributed += amount;
      }
    });

    await trip.save();

    // 📧 Notify participants about the new expense
    trip.participants.forEach((p) => {
      if (splitAmong.includes(p.userId.toString()) && p.email) {
        const tripLink = `https://neotrack.com/trips/${trip._id}`;

        sendEmail(
          p.email,
          `New Expense Added in ${trip.title}`,
          `A new expense has been added to "${trip.title}": ${description} - ₹${amount}`,
          path.join(__dirname, "../html/trips/newExpense.html"),
          {
            name: p.name,
            title: trip.title,
            description,
            amount,
            paidBy: payer.name,
            splitAmount,
            tripLink,
          }
        );
      }
    });


    res.status(200).json({ success: true, message: "Expense added successfully!", trip });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    const settlements = trip.participants.map(p => ({
      userId: p.userId,
      name: p.name,
      contributed: p.contributed,
      owes: p.owes,
      balance: p.contributed - p.owes,
    }));

    res.status(200).json({ success: true, trip, settlements });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

exports.getMyTrips = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure ObjectId format

    // Fetch trips where the user is a participant
    const trips = await Trip.find({ "participants.userId": userId });

    if (!trips.length) {
      return res.status(200).json({ success: false, message: "No trips found." });
    }

    res.status(200).json({ success: true, trips });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

exports.getUserInvitations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Fetch the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Step 2: Use the user's email to query invitations
    const trips = await Trip.find({ "invitations.email": user.email }).populate(
      "user", // Field to populate
      "firstName lastName" // Select only name and email fields
    );

    const invitations = trips
      .map((trip) => {
        const invite = trip.invitations.find((inv) => inv.email === user.email);
        return {
          id: trip._id,
          title: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: invite.status,
          creator:`${trip.user.firstName} ${trip.user.lastName}`,
        };
      })
      .filter((inv) => inv.status === "pending");

    res.status(200).json({ success: true, invitations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch invitations." });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const { tripId, status } = req.body;
    const userId = req.user.id;

    // Step 1: Fetch the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!tripId || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid request parameters." });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    // Find invitation by email instead of userId
    const invitation = trip.invitations.find((inv) => inv.email === user.email);
    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found." });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invitation already responded to." });
    }

    // Update invitation status
    invitation.status = status;

    if (status === "accepted") {

      if (!user || !user.firstName || !user.lastName || !user.email) {
        return res.status(400).json({
          success: false,
          message: "User details incomplete. Cannot add to participants.",
        });
      }

      const fullName = `${user.firstName} ${user.lastName}`;

      // Avoid duplicates
      const alreadyParticipant = trip.participants.some((p) => p.email === user.email);
      if (!alreadyParticipant) {
        trip.participants.push({
          userId: user._id,
          name: fullName,
          email: user.email,
          contributed: 0,
          owes: 0,
        });
      }
    }

    await trip.save();

    res.status(200).json({ success: true, message: `Invitation ${status} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to respond to invitation." });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.body; // Assuming hangoutId is passed as a URL parameter
    const userId = req.user.id; // Authenticated user's ID

    // Fetch the trip by ID
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    // Check if the authenticated user is the creator of the trip
    if (trip.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this trip." });
    }

    // Delete the trip
    await trip.deleteOne();

    res.status(200).json({ success: true, message: "Trip deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};





