"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Gamepad2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const resetPasswordSchema = zod.object({
  code: zod.string().min(6, "Verification code must be 6 digits"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: zod.string().min(6, "Confirm password must match"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type ResetPasswordSchemaType = zod.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSuccess(true);
    toast.success("Password reset completed!");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10 text-center"
        >
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-md rounded-2xl">
            <CardContent className="pt-10 pb-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <CheckCircle size={36} />
              </div>
              <h2 className="text-xl font-black mb-2 text-slate-805">Password Reset Successful</h2>
              <p className="text-slate-500 text-xs mb-6 max-w-xs font-semibold">
                Your account password has been updated. You can now login using your new credentials.
              </p>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-6 rounded-xl shadow-sm text-xs">
                  Proceed to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
          <p className="text-slate-500 text-xs font-bold mt-1">Set New Password</p>
        </div>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-black text-amber-950">Reset Password</CardTitle>
            <CardDescription className="text-xs text-amber-800 font-medium">
              Verify the code and set a strong, secure new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-amber-900 text-xs font-bold">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-digit recovery code"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-xs text-rose-600">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 text-xs font-bold">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl pr-10 shadow-sm text-xs"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#800000]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-900 text-xs font-bold">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold transition-all py-6 rounded-xl text-xs shadow-sm mt-2"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
