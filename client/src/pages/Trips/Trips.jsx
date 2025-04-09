import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import API from "@/services/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";


export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTrip, setActiveTrip] = useState(null);
  const [dialogType, setDialogType] = useState(null); // "participants" | "invitations" | "expense"

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitAmong: [],
  });



  useEffect(() => {
    const fetchTripsAndInvites = async () => {
      try {
        const [tripsRes, invitesRes] = await Promise.all([
          API.post("/trips/my-trips"),
          API.get("/trips/invitations"),
        ]);

        setTrips(tripsRes.data.trips || []);
        console.log("tripsRes",tripsRes)
        setInvitations(invitesRes.data.invitations || []);
        console.log("inviteRes",invitesRes)

      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch trips/invitations.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripsAndInvites();
  }, []);

  const handleInvitationResponse = async (tripId, status) => {
    try {
      await API.post("/trips/invite/respond", { tripId, status });
      toast.success(`Invitation ${status} successfully!`);

      // Update UI: Remove the responded invitation
      setInvitations((prev) => prev.filter((inv) => inv.id !== tripId));

      // If accepted, fetch updated trips
      if (status === "accepted") {
        const tripsRes = await API.post("/trips/my-trips");
        setTrips(tripsRes.data.trips || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} invitation.`);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await API.post("/trips/delete", { tripId: selectedTripId });
      toast.success("Trip deleted successfully!");

      setTrips((prev) => prev.filter((trip) => trip._id !== selectedTripId));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete the trip."
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedTripId(null);
    }
  };

  const openDeleteDialog = (tripId) => {
    setSelectedTripId(tripId);
    setIsDeleteDialogOpen(true);
  };

    
  return (

    <div className="flex justify-center min-h-svh bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-800 p-6 md:p-10">
            {/* Delete Alert Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Trip Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
              onClick={handleDeleteTrip}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Participants Dialog */}
      <Dialog open={dialogType === "participants"} onOpenChange={(open) => !open && setDialogType(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>👥 Participants in {activeTrip?.title}</DialogTitle>
    </DialogHeader>

    <div className="space-y-3 max-h-[60vh] overflow-y-auto mt-2">
      {activeTrip?.participants?.map((p) => (
        <div
          key={p.userId}
          className="flex items-center gap-3 border border-zinc-200 dark:border-zinc-800 p-3 rounded-md shadow-sm"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            {p.name?.[0]?.toUpperCase()}
          </div>
          <div className="text-sm flex flex-col">
            <div className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              {p.name}
              {activeTrip.user === p.userId && (
                <Badge variant="default" className="text-xs">
                  Creator
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </DialogContent>
</Dialog>



      {/* Invitations Dialog */}
      <Dialog open={dialogType === "invitations"} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📨 Invitations for {activeTrip?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto mt-2">
            {activeTrip?.invitations?.map((inv) => (
              <div
                key={inv.userId}
                className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 p-3 rounded-md shadow-sm"
              >
                <div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">{inv.email}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Invitation Status</div>
                </div>
                <div>
                  {inv.status === "pending" && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md">⏳ Pending</span>
                  )}
                  {inv.status === "rejected" && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-md">❌ Rejected</span>
                  )}
                  {inv.status === "accepted" && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md">✅ Accepted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>


      {/* Add Expense Dialog */}
      <Dialog open={dialogType === "expense"} onOpenChange={(open) => {
        if (!open) {
          setDialogType(null);
          setExpenseData({ description: "", amount: "", paidBy: "", splitAmong: [] });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>➕ Add Expense for {activeTrip?.title}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);

              try {
                const { description, amount, paidBy, splitAmong } = expenseData;

                await API.post("/trips/add-expense", {
                  tripId: activeTrip._id,
                  description,
                  amount: parseFloat(amount),
                  paidBy,
                  splitAmong,
                });

                toast.success("Expense added successfully!");

                // Optionally update trips or refetch
                const updatedTrips = await API.post("/trips/my-trips");
                setTrips(updatedTrips.data.trips);
                setDialogType(null); // Close dialog
                setExpenseData({ description: "", amount: "", paidBy: "", splitAmong: [] }); // Reset
              } catch (err) {
                toast.error(err.response?.data?.message || "Failed to add expense.");
              }
              finally {
                setLoading(false); // End loading
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Paid By</label>
              <select
                className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                value={expenseData.paidBy}
                onChange={(e) => setExpenseData({ ...expenseData, paidBy: e.target.value })}
                required
              >
                <option value="">-- Select Payer --</option>
                {activeTrip?.participants.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.name}
                  </option>
                ))}
              </select>

            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Split Among</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {activeTrip?.participants.map((p) => (
                  <label key={p.userId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={expenseData.splitAmong.includes(p.userId)}
                      onChange={(e) => {
                        const newSplit = e.target.checked
                          ? [...expenseData.splitAmong, p.userId]
                          : expenseData.splitAmong.filter((id) => id !== p.userId);
                        setExpenseData({ ...expenseData, splitAmong: newSplit });
                      }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="ghost" type="button">Cancel</Button>
              </DialogClose>
              <Button variant="outline" type="submit">
              {loading ? "Adding Expense..." : "Add Expense"}
              </Button>
            </div>
          </form>

        </DialogContent>
      </Dialog>

      {/* Trip Details Dialog */}
      <Dialog open={dialogType === "details"} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
          <DialogTitle>📋 Trip Details: <span className="text-primary">{activeTrip?.title}</span></DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 max-h-[60vh] overflow-y-auto">
            {/* Expenses */}
            <div>
              <h3 className="text-base font-semibold mb-2">📌 Expenses</h3>
              {activeTrip?.expenses?.length === 0 ? (
                <p className="text-muted-foreground italic">No expenses added yet.</p>
              ) : (
                <div className="space-y-3">
                  {activeTrip?.expenses.map((exp) => (
                    <div
                      key={exp._id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{exp.description}</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">₹{exp.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="block">🧾 Paid by: <strong>{activeTrip.participants.find(p => p.userId === exp.paidBy)?.name || "Unknown"}</strong></span>
                        <span className="block">
                          👥 Split among: {exp.splitAmong.map(id => activeTrip.participants.find(p => p.userId === id)?.name).join(", ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contributions */}
            <div>
              <h3 className="text-base font-semibold mb-2">👤 Participant Contributions</h3>
              <div className="space-y-2">
                {activeTrip?.participants?.map(p => (
                  <div
                    key={p.userId}
                    className="flex justify-between items-center border border-zinc-100 dark:border-zinc-800 rounded-md px-3 py-2 bg-white dark:bg-zinc-950"
                  >
                    <span className="font-medium">{p.name}</span>
                    <div className="text-sm text-right space-y-0.5">
                      <div className="text-green-600 dark:text-green-400">Contributed: ₹{p.contributed.toFixed(2)}</div>
                      <div className="text-red-600 dark:text-red-400">Owes: ₹{p.owes.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      <div className="w-full max-w-4xl flex flex-col gap-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-between items-center"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">
            ✈️ Your Trips
          </h1>
          <Button asChild className="shadow-lg hover:scale-[1.02] transition-transform">
            <Link to="/track/trips/new">
              <Plus className="w-5 h-5 mr-2" /> Add Trip
            </Link>
          </Button>
        </motion.div>

        {/* Trips Section */}
        <section className="grid gap-6">
  {loading ? (
    <p className="text-zinc-500 dark:text-zinc-400">Loading your trips...</p>
  ) : trips.length === 0 ? (
    <div className="text-center text-zinc-500 dark:text-zinc-400 italic">
      No trips found. Hit that <strong>Add Trip</strong> button!
    </div>
  ) : (
    <motion.div
      className="grid sm:grid-cols-2 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1 } },
      }}
    >
      {trips.map((trip) => (
        <motion.div
          key={trip._id}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          <Card className="shadow-md hover:shadow-xl border border-zinc-200 dark:border-zinc-700 transition-shadow">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">{trip.title}</CardTitle>
              <button
                onClick={() => openDeleteDialog(trip._id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Delete Trip"
              >
                <Trash size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-2 text-sm space-y-2 text-zinc-600 dark:text-zinc-300">
              <p>
                📅 {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </p>
              <p>
                💸 Expenses: ₹ {trip.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0}
              </p>

              <div className="flex flex-col gap-2 w-full">
                {/* First Row */}
                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setActiveTrip(trip);
                      setDialogType("participants");
                    }}
                  >
                    👥 Participants
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setActiveTrip(trip);
                      setDialogType("invitations");
                    }}
                  >
                    📨 Invitations
                  </Button>
                </div>

                {/* Second Row */}
                <div className="flex gap-2 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setActiveTrip(trip);
                      setDialogType("details");
                    }}
                  >
                    📋 View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setActiveTrip(trip);
                      setDialogType("expense");
                    }}
                  >
                    ➕ Add Expense
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )}
</section>

        {/* Invitations Section */}
        {invitations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid gap-6 mt-4"
          >
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">📬 Pending Invitations</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {invitations.map((inv) => (
                <motion.div key={inv.id} whileHover={{ scale: 1.02 }} className="transition-transform">
                  <Card className="shadow-md hover:shadow-xl border border-amber-200 dark:border-amber-700 transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{inv.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 text-zinc-600 dark:text-zinc-300">
                      <p>
                        🗓️ {new Date(inv.startDate).toLocaleDateString()} -{" "}
                        {new Date(inv.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                          Invited by{" "}
                          <span className="font-medium">{inv.creator || "Unknown"}</span>
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleInvitationResponse(inv.id, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleInvitationResponse(inv.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
