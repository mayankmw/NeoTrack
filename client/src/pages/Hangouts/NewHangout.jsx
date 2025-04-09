import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import API from "@/services/api";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function NewHangoutPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState([""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleParticipantChange = (index, value) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const addParticipantField = () => {
    setParticipants([...participants, ""]);
  };

  const removeParticipantField = (index) => {
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        location,
        date: date ? format(date, "yyyy-MM-dd") : "",
        description,
        participants: participants
          .filter((email) => email.trim() !== "")
          .map((email) => ({ email: email.trim() })),
      };

      await API.post("/hangouts/new", payload);
      toast.success("Hangout created successfully!");
      navigate("/track/hangouts");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create hangout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-6 md:p-10 bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-800 min-h-svh">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              🎉 Create New Hangout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-white/70 dark:bg-zinc-800/70 border-none focus:ring-2 focus:ring-indigo-500 mt-2"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="bg-white/70 dark:bg-zinc-800/70 border-none focus:ring-2 focus:ring-indigo-500 mt-2"
                />
              </div>
              
              <div>
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md shadow-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for the hangout"
                  className="bg-white/70 dark:bg-zinc-800/70 border-none focus:ring-2 focus:ring-indigo-500 mt-2"
                />
              </div>

              <div>
                <Label>Invite Participants (email)</Label>
                <div className="flex flex-col gap-2">
                  {participants.map((email, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-2 items-center"
                    >
                      <Input
                        type="email"
                        placeholder="friend@example.com"
                        value={email}
                        onChange={(e) => handleParticipantChange(index, e.target.value)}
                        className="bg-white/70 dark:bg-zinc-800/70 border-none focus:ring-2 focus:ring-indigo-500 mt-2"
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="shadow-md hover:scale-[1.02] transition-transform"
                          onClick={() => removeParticipantField(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </motion.div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="shadow-md hover:scale-[1.02] transition-transform mt-2"
                    onClick={addParticipantField}
                  >
                    Add Participant
                  </Button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button type="submit" variant="outline" disabled={loading} className="w-full shadow-md">
                  {loading ? "Creating..." : "Create Hangout"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
