"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Gamepad2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const signupSchema = zod.object({
  fullName: zod.string().min(3, "Full name must be at least 3 characters"),
  username: zod.string().min(4, "Username must be at least 4 characters"),
  email: zod.string().email("Invalid email address"),
  mobile: zod.string().min(10, "Mobile number must be at least 10 digits"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type SignupSchemaType = zod.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      mobile: "",
    },
  });

  const onSubmit = async (data: SignupSchemaType) => {
    const success = await signup(data.username, data.email, data.mobile, data.fullName, data.password);
    if (success) {
      toast.success("OTP sent to your mobile number!");
      router.push("/auth/otp");
    } else {
      toast.error("Registration initiation failed.");
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
          <p className="text-slate-500 text-xs font-bold mt-1">Join the Premium Hub</p>
        </div>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-black text-amber-950">Create Account</CardTitle>
            <CardDescription className="text-xs text-amber-800 font-medium">
              Register now and claim your welcome rewards!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-amber-900 text-xs font-bold">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-600">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-amber-900 text-xs font-bold">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose username"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-xs text-rose-600">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900 text-xs font-bold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@bullwavegames.com"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-amber-900 text-xs font-bold">Mobile Number</Label>
                <Input
                  id="mobile"
                  placeholder="Enter 10 digit number"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("mobile")}
                />
                {errors.mobile && (
                  <p className="text-xs text-rose-600">{errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900 text-xs font-bold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold transition-all py-6 rounded-xl text-xs shadow-sm mt-2"
              >
                {isLoading ? "Initiating..." : "Register & Get OTP"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-amber-200/30 pt-6">
            <span className="text-xs text-slate-500 font-semibold">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#800000] hover:underline font-black">
                Sign In
              </Link>
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
