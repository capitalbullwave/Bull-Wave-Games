"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiRequest } from "../lib/api";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.hasOwnProperty("Razorpay")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface User {
  id: string;
  username: string;
  email: string;
  mobile: string;
  fullName: string;
  dob?: string;
  gender?: string;
  address?: string;
  avatarUrl?: string;
  kycStatus: "pending" | "verified" | "rejected" | "unverified";
  walletBalance: number;
  winningsBalance: number;
  bonusBalance: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  otpSentTo: string | null;
  isLoading: boolean;
  error: string | null;
  login: (identity: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, mobile: string, fullName: string) => Promise<boolean>;
  sendOTP: (mobile: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  depositFunds: (amount: number) => Promise<void>;
  withdrawFunds: (amount: number) => Promise<boolean>;
  deductEntryFee: (amount: number) => Promise<boolean>;
  setPassword: (password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      otpSentTo: null,
      isLoading: false,
      error: null,

      login: async (identity, password) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Post credentials to Auth controller
          const tokenResp = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              username_or_mobile: identity,
              password: password,
            }),
          });

          const token = tokenResp.access_token;
          
          // Temporary save token so /users/me request is authenticated
          set({ token });

          // 2. Fetch authenticated profile detail
          const profile = await apiRequest("/users/me");

          // 3. Map details to User interface
          const mappedUser: User = {
            id: String(profile.id || "u_7721"),
            username: profile.username,
            email: profile.email,
            mobile: profile.mobile,
            fullName: profile.profile?.full_name || profile.username,
            dob: profile.profile?.dob || "",
            gender: profile.profile?.gender || "male",
            address: profile.profile?.address || "",
            avatarUrl: profile.profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.username}`,
            kycStatus: profile.kyc?.status || "unverified",
            walletBalance: (profile.wallet?.main_balance || 0) + (profile.wallet?.winning_balance || 0) + (profile.wallet?.bonus_balance || 0),
            winningsBalance: profile.wallet?.winning_balance || 0,
            bonusBalance: profile.wallet?.bonus_balance || 0,
          };

          set({
            isAuthenticated: true,
            user: mappedUser,
            token: token,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false, token: null, user: null, isAuthenticated: false });
          return false;
        }
      },

      signup: async (username, email, mobile, fullName) => {
        set({ isLoading: true, error: null });
        try {
          await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({
              username,
              email,
              mobile,
              password: "password123", // Set a unified fallback sandbox credential for client registers
            }),
          });
          set({
            otpSentTo: mobile,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      sendOTP: async (mobile) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await apiRequest("/auth/resend-otp", {
            method: "POST",
            body: JSON.stringify({
              mobile_or_email: mobile,
              purpose: "register",
            }),
          });
          // Show the generated sandbox OTP in console logs for direct developer verification
          console.log(`[Sandbox OTP Hint]: Verification code sent -> ${resp.otp_sandbox_hint}`);
          set({ otpSentTo: mobile, isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      verifyOTP: async (otp) => {
        set({ isLoading: true, error: null });
        try {
          const mobile = get().otpSentTo || "";
          await apiRequest("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({
              mobile_or_email: mobile,
              otp_code: otp,
              purpose: "register",
            }),
          });

          // Post-verification auto login
          const tokenResp = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
              username_or_mobile: mobile,
              password: "password123",
            }),
          });

          const token = tokenResp.access_token;
          set({ token });

          const profile = await apiRequest("/users/me");

          const mappedUser: User = {
            id: String(profile.id || "u_new"),
            username: profile.username,
            email: profile.email,
            mobile: profile.mobile,
            fullName: profile.profile?.full_name || profile.username,
            dob: profile.profile?.dob || "",
            gender: profile.profile?.gender || "male",
            address: profile.profile?.address || "",
            avatarUrl: profile.profile?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.username}`,
            kycStatus: profile.kyc?.status || "unverified",
            walletBalance: (profile.wallet?.main_balance || 0) + (profile.wallet?.winning_balance || 0) + (profile.wallet?.bonus_balance || 0),
            winningsBalance: profile.wallet?.winning_balance || 0,
            bonusBalance: profile.wallet?.bonus_balance || 0,
          };

          set({
            isAuthenticated: true,
            user: mappedUser,
            token: token,
            otpSentTo: null,
            isLoading: false,
          });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        // Send async call to revoke token in background if possible
        const token = get().token;
        if (token) {
          apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
        }
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          otpSentTo: null,
          error: null,
        });
      },

      updateProfile: async (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          try {
            const profileUpdates = {
              full_name: updates.fullName || currentUser.fullName,
              dob: updates.dob || currentUser.dob,
              gender: updates.gender || currentUser.gender,
              address: updates.address || currentUser.address,
            };

            const updatedProfile = await apiRequest("/profile", {
              method: "PUT",
              body: JSON.stringify(profileUpdates),
            });

            set({
              user: {
                ...currentUser,
                fullName: updatedProfile.full_name,
                dob: updatedProfile.dob,
                gender: updatedProfile.gender,
                address: updatedProfile.address,
              },
            });
          } catch (err) {
            console.error("Failed live profile updates", err);
          }
        }
      },

      depositFunds: async (amount) => {
        try {
          // 1. Setup payment checkout
          const depResp = await apiRequest("/wallet/deposit", {
            method: "POST",
            body: JSON.stringify({ amount, gateway: "razorpay" }),
          });

          const { id: depositId, gateway_tx_id: orderId, razorpay_key_id: keyId } = depResp;

          // 2. Load Razorpay SDK
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            throw new Error("Failed to load Razorpay payment gateway SDK.");
          }

          // 3. Open Razorpay Checkout Modal
          return new Promise<void>((resolve, reject) => {
            let isPaymentCompleted = false;

            const options = {
              key: keyId,
              amount: amount * 100, // Razorpay amount in paise
              currency: "INR",
              name: "Bull Wave",
              description: "Deposit Funds to Wallet",
              order_id: orderId,
              handler: async (response: any) => {
                isPaymentCompleted = true;
                try {
                  // 4. Verify payment with backend
                  await apiRequest("/wallet/verify-payment", {
                    method: "POST",
                    body: JSON.stringify({
                      deposit_id: depositId,
                      payment_id: response.razorpay_payment_id,
                      order_id: response.razorpay_order_id,
                      signature: response.razorpay_signature,
                    }),
                  });

                  // 5. Query updated balances
                  const balances = await apiRequest("/wallet/balance");
                  const currentUser = get().user;
                  if (currentUser) {
                    set({
                      user: {
                        ...currentUser,
                        walletBalance: (balances.main_balance || 0) + (balances.winning_balance || 0) + (balances.bonus_balance || 0),
                        winningsBalance: balances.winning_balance || 0,
                        bonusBalance: balances.bonus_balance || 0,
                      },
                    });
                  }
                  resolve();
                } catch (err: any) {
                  console.error("Razorpay verification failed", err);
                  reject(err);
                }
              },
              prefill: {
                name: get().user?.fullName || "",
                email: get().user?.email || "",
                contact: get().user?.mobile || "",
              },
              theme: {
                color: "#800000", // Sleek dark crimson matching the app
              },
              modal: {
                ondismiss: () => {
                  if (!isPaymentCompleted) {
                    reject(new Error("Payment window closed by user."));
                  }
                }
              }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          });
        } catch (err: any) {
          console.error("Live deposit sequence failed", err);
          throw err;
        }
      },

      withdrawFunds: async (amount) => {
        const currentUser = get().user;
        if (currentUser && currentUser.winningsBalance >= amount) {
          try {
            // Trigger winning balance withdrawal
            await apiRequest("/wallet/withdraw", {
              method: "POST",
              body: JSON.stringify({ amount, bank_account_id: 1 }),
            });

            const balances = await apiRequest("/wallet/balance");
            set({
              user: {
                ...currentUser,
                walletBalance: (balances.main_balance || 0) + (balances.winning_balance || 0) + (balances.bonus_balance || 0),
                winningsBalance: balances.winning_balance || 0,
                bonusBalance: balances.bonus_balance || 0,
              },
            });
            return true;
          } catch (err) {
            console.error("Live withdrawal failed", err);
          }
        }
        return false;
      },

      deductEntryFee: async (amount) => {
        const currentUser = get().user;
        if (currentUser && currentUser.walletBalance >= amount) {
          // Local checkout mapping & balance updates
          let newBonus = currentUser.bonusBalance;
          let newWinnings = currentUser.winningsBalance;
          
          if (newBonus >= amount) {
            newBonus -= amount;
          } else {
            const remainder = amount - newBonus;
            newBonus = 0;
            newWinnings -= remainder;
          }

          set({
            user: {
              ...currentUser,
              walletBalance: currentUser.walletBalance - amount,
              bonusBalance: newBonus,
              winningsBalance: newWinnings,
            },
          });
          return true;
        }
        return false;
      },
      
      setPassword: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiRequest("/users/set-password", {
            method: "POST",
            body: JSON.stringify({ password }),
          });
          set({ isLoading: false });
          return true;
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },
    }),
    {
      name: "bullwave-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
