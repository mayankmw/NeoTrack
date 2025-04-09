const express = require("express");
const { createTrip, addExpense, getTrip, getMyTrips, getUserInvitations, respondToInvitation, deleteTrip } = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new trip (Protected Route)
router.post("/new", authMiddleware, createTrip);

// Add an expense to a trip (Protected Route)
router.post("/add-expense", authMiddleware, addExpense);

// Get trip details (Protected Route)
router.post("/get-trip", authMiddleware, getTrip);

router.post("/my-trips", authMiddleware, getMyTrips);

router.get("/invitations", authMiddleware, getUserInvitations);

router.post("/invite/respond", authMiddleware, respondToInvitation);

router.post("/delete", authMiddleware, deleteTrip);


module.exports = router;
