import React from "react";
import { SignupForm } from "@/components/signup-form";
import NeoTrackLogo from "@/assets/logo.svg";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <img src={NeoTrackLogo} alt="NeoTrack Logo" className="h-6 w-6" />
          NeoTrack
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
