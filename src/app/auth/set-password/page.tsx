"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Gamepad2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SetPasswordPage() {
  const router = useRouter();
  const { setPassword, isLoading, error, user } = useAuthStore();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (newPassword.length < 4) {
      setValidationError("Password must be at least 4 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    const success = await setPassword(newPassword);
    if (success) {
      toast.success("Password successfully saved!");
      router.push("/lobby");
    } else {
      toast.error("Failed to set your password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-pink/15 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#800000] to-[#b30000] flex items-center justify-center shadow-md mx-auto mb-3">
            <Gamepad2 className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-widest text-[#800000]">BULL WAVE</h1>
          <p className="text-slate-500 text-xs font-bold mt-1">Set Account Credentials</p>
        </div>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-black text-amber-950">Set Password</CardTitle>
            <CardDescription className="text-xs text-amber-800 font-medium">
              Choose a strong, secure password for logging into your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || validationError) && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle size={18} />
                  <span>{validationError || error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 text-xs font-bold">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-900 text-xs font-bold">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold transition-all py-6 rounded-xl text-xs shadow-sm mt-2"
              >
                {isLoading ? "Saving Password..." : "Set Password & Enter Lobby"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-amber-200/30 pt-6">
            <span className="text-xs text-slate-500 font-semibold">
              Logged in as <strong className="text-amber-950 font-black">{user?.username || "Verified Gamer"}</strong>
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
