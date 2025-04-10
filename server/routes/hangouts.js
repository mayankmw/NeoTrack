const express = require("express");
const { 
  createHangout, 
  getMyHangouts, 
  getHangout, 
  respondToInvitation,
  getUserInvitations, 
  addExpense,
  completeHangout,
  deleteHangout 
} = require("../controllers/hangoutController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new hangout (Protected Route)
router.post("/new", authMiddleware, createHangout);

// Get the user's hangouts (Protected Route)
router.post("/my-hangouts", authMiddleware, getMyHangouts);

// Get details of a specific hangout (Protected Route)
router.post("/get-hangout", authMiddleware, getHangout);

router.get("/invitations", authMiddleware, getUserInvitations);

// Respond to a hangout invitation (Protected Route)
router.post("/invite/respond", authMiddleware, respondToInvitation);

// Add an expense to a hangout (Protected Route)
router.post("/add-expense", authMiddleware, addExpense);

// Mark a hangout as completed (Protected Route)
router.post("/complete", authMiddleware, completeHangout);


router.post("/delete", authMiddleware, deleteHangout);


module.exports = router;
