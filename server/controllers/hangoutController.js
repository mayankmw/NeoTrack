const Hangout = require("../models/Hangout.js");
const User = require("../models/User.js");
const sendEmail = require("../utils/sendEmail.js");
const path = require("path");

exports.createHangout = async (req, res) => {
  try {
    const { title, location, date, budget, participants } = req.body;
    const userId = req.user.id;

    if (!title || !location || !date) {
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

    // Create the hangout with only the creator in the participants
    const newHangout = new Hangout({
      user: userId,
      title,
      location,
      date,
      budget,
      participants: [creatorParticipant],
      invitations: [],
      expenses: [],
    });

    await newHangout.save();

    for (let p of participants) {
      const existingUser = await User.findOne({ email: p.email });

      if (existingUser) {
        newHangout.invitations.push({
          email: existingUser.email,
          userId: existingUser._id,
          status: "pending",
        });

        const acceptLink = `https://neotrack.com/hangouts/${newHangout._id}/accept`;

        await sendEmail(
          existingUser.email,
          `Hangout Invitation: ${title}`,
          `You have been invited to join the hangout "${title}" at ${location}.`,
          path.join(__dirname, "../html/hangouts/hangoutInvite.html"),
          {
            firstName: existingUser.firstName,
            title,
            location,
            acceptLink,
          }
        );
      } else {
        newHangout.invitations.push({
          email: p.email,
          status: "pending",
        });

        const registerLink = `https://neotrack.com/register`;

        await sendEmail(
          p.email,
          `Join NeoTrack to Accept Hangout Invitation`,
          `You've been invited to join the hangout "${title}" at ${location}. Please register to accept.`,
          path.join(__dirname, "../html/hangouts/hangoutInviteRegister.html"),
          {
            title,
            location,
            registerLink,
          }
        );
      }
    }

    await newHangout.save();

    res.status(201).json({ success: true, message: "Hangout created successfully!", hangout: newHangout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

exports.addExpense = async (req, res) => {
    try {
      const { hangoutId, description, amount, paidBy, splitAmong } = req.body;
  
      // Validate input
      if (!hangoutId || !description || !amount || !paidBy || !splitAmong || splitAmong.length === 0) {
        return res.status(400).json({ success: false, message: "All fields are required." });
      }
  
      // Fetch the hangout by ID
      const hangout = await Hangout.findById(hangoutId);
      if (!hangout) return res.status(404).json({ success: false, message: "Hangout not found." });
  
      // Validate that the payer is part of the hangout
      const payer = hangout.participants.find(p => p.userId.toString() === paidBy);
      if (!payer) {
        return res.status(400).json({ success: false, message: "Payer is not a part of this hangout." });
      }
  
      // Add the expense to the hangout
      hangout.expenses.push({ description, amount, paidBy, splitAmong });
  
      const splitAmount = parseFloat((amount / splitAmong.length).toFixed(2));
  
      // Update the participant balances
      hangout.participants.forEach((participant) => {
        if (splitAmong.includes(participant.userId.toString())) {
          participant.owes += splitAmount;
        }
        if (participant.userId.toString() === paidBy) {
          participant.contributed += amount;
        }
      });
  
      // Save the updated hangout
      await hangout.save();
  
      // Notify participants about the new expense
      const notifyParticipants = async () => {
        const notifications = hangout.participants
          .filter(p => splitAmong.includes(p.userId.toString()) && p.email)
          .map(p => {
            const hangoutLink = `https://neotrack.com/hangouts/${hangout._id}`;
            return sendEmail(
              p.email,
              `New Expense Added in ${hangout.title}`,
              `A new expense has been added to "${hangout.title}": ${description} - ₹${amount}`,
              path.join(__dirname, "../html/hangouts/newExpense.html"),
              {
                name: p.name,
                title: hangout.title,
                description,
                amount,
                paidBy: payer.name,
                splitAmount,
                hangoutLink,
              }
            );
          });
  
        await Promise.all(notifications);
      };
  
      await notifyParticipants();
  
      res.status(200).json({ success: true, message: "Expense added successfully!", hangout });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  };
  

exports.getHangout = async (req, res) => {
  try {
    const { hangoutId } = req.body;
    const hangout = await Hangout.findById(hangoutId);
    if (!hangout) return res.status(404).json({ success: false, message: "Hangout not found." });

    const settlements = hangout.participants.map(p => ({
      userId: p.userId,
      name: p.name,
      contributed: p.contributed,
      owes: p.owes,
      balance: p.contributed - p.owes,
    }));

    res.status(200).json({ success: true, hangout, settlements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

exports.getMyHangouts = async (req, res) => {
  try {
    const userId = req.user.id;

    const hangouts = await Hangout.find({ "participants.userId": userId });

    if (!hangouts.length) {
      return res.status(200).json({ success: false, message: "No hangouts found." });
    }

    res.status(200).json({ success: true, hangouts });
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
      const hangouts = await Hangout.find({ "invitations.email": user.email }).populate(
        "user", // Field to populate
        "firstName lastName" // Select only name and email fields
      );
  
      const invitations = hangouts
        .map((hangout) => {
          console.log("hang",hangout)
          const invite = hangout.invitations.find((inv) => inv.email === user.email);
          return {
            id: hangout._id,
            title: hangout.title,
            location: hangout.location,
            date: hangout.date,
            status: invite.status,
            creator:`${hangout.user.firstName} ${hangout.user.lastName}`,
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
    const { hangoutId, status } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!hangoutId || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid request parameters." });
    }

    const hangout = await Hangout.findById(hangoutId);
    if (!hangout) {
      return res.status(404).json({ success: false, message: "Hangout not found." });
    }

    const invitation = hangout.invitations.find((inv) => inv.email === user.email);
    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found." });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invitation already responded to." });
    }

    invitation.status = status;

    if (status === "accepted") {
      const fullName = `${user.firstName} ${user.lastName}`;
      const alreadyParticipant = hangout.participants.some((p) => p.email === user.email);
      if (!alreadyParticipant) {
        hangout.participants.push({
          userId: user._id,
          name: fullName,
          email: user.email,
          contributed: 0,
          owes: 0,
        });
      }
    }

    await hangout.save();

    res.status(200).json({ success: true, message: `Invitation ${status} successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to respond to invitation." });
  }
};

exports.completeHangout = async (req, res) => {
  try {
    const { hangoutId } = req.body; // Hangout ID passed in the request body
    const userId = req.user.id; // Authenticated user's ID

    // Fetch the hangout by ID
    const hangout = await Hangout.findById(hangoutId);
    if (!hangout) {
      return res.status(200).json({ success: false, message: "Hangout not found." });
    }

    // Check if the authenticated user is the creator of the hangout
    if (hangout.user.toString() !== userId) {
      return res.status(200).json({ success: false, message: "You are not authorized to complete this hangout." });
    }

    // Check if the hangout is already completed
    if (hangout.status === "completed") {
      return res.status(200).json({ success: false, message: "This hangout is already marked as completed." });
    }

    // Mark the hangout as completed
    hangout.status = "completed";

    await hangout.save();

    // Prepare email details
    const emailPromises = hangout.participants.map((participant) => {
      if (participant.email) {
        return sendEmail(
          participant.email,
          `Hangout Completed: ${hangout.title}`,
          `The hangout "${hangout.title}" has been marked as completed.`,
          path.join(__dirname, "../html/hangouts/hangoutCompleted.html"),
          {
            name: participant.name,
            title: hangout.title,
            location: hangout.location,
            date: hangout.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            budget: hangout.budget || 0,
            status: hangout.status,
            participants: hangout.participants.map((p) => ({
              name: p.name,
              email: p.email,
              contributed: p.contributed,
              owes: p.owes,
            })),
            expenses: hangout.expenses.map((expense) => ({
              description: expense.description,
              amount: expense.amount,
              paidBy: expense.paidBy,
              splitAmong: expense.splitAmong,
            })),
          }
        );
      }
    });
    

    // Send notifications to all participants
    await Promise.all(emailPromises);

    res.status(200).json({
      success: true,
      message: "Hangout marked as completed. Notifications sent to all participants.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};



exports.deleteHangout = async (req, res) => {
  try {
    const { hangoutId } = req.body; // Assuming hangoutId is passed as a URL parameter
    const userId = req.user.id; // Authenticated user's ID

    // Fetch the hangout by ID
    const hangout = await Hangout.findById(hangoutId);
    if (!hangout) {
      return res.status(404).json({ success: false, message: "Hangout not found." });
    }

    // Check if the authenticated user is the creator of the hangout
    if (hangout.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this hangout." });
    }

    // Delete the hangout
    await hangout.deleteOne();

    res.status(200).json({ success: true, message: "Hangout deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};
