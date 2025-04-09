import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "../src/pages/Home/HomePage";
import LoginPage from "../src/pages/Auth/Login";
import NotFoundPage from "../src/pages/NotFound/NotFound";
import './App.css'
import './index.css'
import SignUpPage from "./pages/Auth/SignUp";
import DashboardPage from "./pages/Dashboard/Dashboard";
import TripsPage from "./pages/Trips/Trips";
import NewTripPage from "./pages/Trips/NewTrip";
import { ThemeProvider } from "@/components/theme-provider";
import AuthRoute from "./components/auth/auth-route";
import HangoutsPage from "./pages/Hangouts/Hangouts";
import NewHangoutPage from "./pages/Hangouts/NewHangout";

function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="app-content">
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route
                path="/dashboard"
                element={
                  <AuthRoute>
                    <DashboardPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/track/trips"
                element={
                  <AuthRoute>
                    <TripsPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/track/trips/new"
                element={
                  <AuthRoute>
                    <NewTripPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/track/hangouts"
                element={
                  <AuthRoute>
                    <HangoutsPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/track/hangouts/new"
                element={
                  <AuthRoute>
                    <NewHangoutPage />
                  </AuthRoute>
                }
              />              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
