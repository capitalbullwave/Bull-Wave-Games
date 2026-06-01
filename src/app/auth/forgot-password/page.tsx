"use client";

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
import { Gamepad2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

const forgotPasswordSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
});

type ForgotPasswordSchemaType = zod.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordSchemaType) => {
    const success = await forgotPassword(data.email);
    if (success) {
      toast.success("Password recovery OTP sent successfully!");
      // We can pass the email in query params so the reset page knows who it is
      router.push(`/auth/reset-password?email=${encodeURIComponent(data.email)}`);
    } else {
      toast.error("Failed to send recovery OTP.");
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
          <h1 className="text-3xl font-black tracking-widest text-[#800000]">BULL WAVE</h1>
          <p className="text-slate-500 text-xs font-bold mt-1">Recover Password</p>
        </div>

        <Card className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-amber-950">
              <Link href="/auth/login" className="p-1 hover:bg-[#800000]/10 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-slate-500 hover:text-[#800000]" />
              </Link>
              Forgot Password
            </CardTitle>
            <CardDescription className="text-xs text-amber-800 font-medium">
              Enter your email address to receive a secure recovery code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900 text-xs font-bold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-white border-amber-200/80 focus:ring-primary/50 text-slate-800 rounded-xl shadow-sm text-xs"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold transition-all py-6 rounded-xl text-xs shadow-sm mt-2"
              >
                {isLoading ? "Sending Link..." : "Send Recovery Email"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
