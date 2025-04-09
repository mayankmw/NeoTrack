import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API from "@/services/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2 } from "lucide-react";

export function SignupForm({ className, ...props }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Password, Step 3: Personal Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Move to password step
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setStep(3); // Move to personal details step
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post("/auth/sign-up", {
        firstName,
        lastName,
        email,
        password,
        mobile,
      });

      if (response.data.success) {
        toast.success("Signup successful! Welcome to NeoTrack!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="relative flex flex-col items-center">
          {step > 1 && (
            <button
              type="button"
              className="absolute left-0 p-2 rounded-full hover:bg-gray-200 text-white border-radius:15px"
              onClick={() => setStep(step - 1)} // Go back to the previous step
              aria-label="Go back to the previous step"
            >
              <FaArrowLeft size={20} />
            </button>
          )}
          <div className="text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
            {step == 1 && (
              <CardDescription>
                Sign up with your Apple or Google account
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  {/* Apple Login SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button>
                <Button variant="outline" className="w-full">
                  {/* Google Login SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-3 text-gray-600 hover:text-gray-800 bgless-button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={confirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-3 text-gray-600 hover:text-gray-800 bgless-button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  >
                    {confirmPasswordVisible ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="outline" className="w-full">
                Continue
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  type="text"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-white" />
                ) : (
                  "Complete Sign Up"
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Log In
            </a>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
