"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Gamepad2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function OTPPage() {
  const router = useRouter();
  const { verifyOTP, sendOTP, otpSentTo, isLoading, error } = useAuthStore();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Clear any stale errors from previous pages (e.g. signup failures)
    useAuthStore.setState({ error: null });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }

    const success = await verifyOTP(otpCode);
    if (success) {
      toast.success("Account successfully verified! Please log in.");
      router.push("/auth/login");
    } else {
      toast.error("Invalid verification code.");
    }
  };

  const handleResend = async () => {
    if (otpSentTo) {
      const success = await sendOTP(otpSentTo);
      if (success) {
        setCountdown(30);
        toast.success("A new verification code has been sent!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gaming-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-pink/15 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mx-auto mb-3 border border-[#D4AF37]/30 bg-white p-0.5">
            <img src="/logo.png" alt="Bull Wave Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-3xl font-black neon-text-blue tracking-widest">BULL WAVE</h1>
          <p className="text-muted-foreground text-sm mt-1">Verification Step</p>
        </div>

        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter the 6-digit verification code sent to your mobile number. Use **123456** to pass.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-slate-100 border border-slate-300 focus:ring-2 focus:ring-primary/50 text-slate-950 transition-all outline-none"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-neon-pink text-white font-bold hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all py-6 rounded-xl text-base"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-glass-border/30 pt-6">
            <div className="text-sm text-muted-foreground text-center">
              {countdown > 0 ? (
                <span>Resend OTP in <strong className="text-white">{countdown}s</strong></span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-primary hover:underline font-semibold"
                >
                  Resend OTP Code
                </button>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
