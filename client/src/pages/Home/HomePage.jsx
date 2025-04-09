import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-zinc-800 mb-4">Welcome to NeoTrack</h1>
        <p className="text-lg text-zinc-600">
          Your all-in-one solution for tracking expenses, trips, and more!
        </p>
      </header>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Trip Tracking Feature */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-zinc-800 mb-2">📍 Trip Tracking</h2>
          <p className="text-sm text-zinc-600">
            Plan, track, and manage your trips effortlessly.
          </p>
        </div>

        {/* Expense Tracking Feature */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-zinc-800 mb-2">💰 Expense Tracking</h2>
          <p className="text-sm text-zinc-600">
            Keep a close eye on your finances and stay in control.
          </p>
        </div>

        {/* Notifications Feature */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-zinc-800 mb-2">🔔 Notifications</h2>
          <p className="text-sm text-zinc-600">
            Get timely alerts via messages or calls to stay updated.
          </p>
        </div>
      </section>

      {/* Chatbot Section */}
      <section className="mb-12">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">🤖 Meet Neo, Your Assistant</h2>
          <p className="text-sm text-zinc-600 mb-6">
            Need help? Neo, your smart chatbot, is here to assist with all your tracking needs.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <footer>
        <p className="text-zinc-600 text-sm mb-4">
          Ready to start your tracking journey with NeoTrack?
        </p>
         <Button
          onClick={() => navigate("/login")}
          className="bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-600 text-lg"
        >
          Get Started 🚀
        </Button>
      </footer>
    </div>
  );
};

export default HomePage;
