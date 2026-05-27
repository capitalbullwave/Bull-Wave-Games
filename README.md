<<<<<<< HEAD
# 🏆 Bull Wave Games — Premium User Panel

Welcome to the **Bull Wave Games User Panel**, a high-fidelity, luxury-themed online gaming portal replicating the Daman Games experience. Engineered with a premium **Maroon & Gold** visual identity, this application provides an immersive, mobile-first gaming lobby, comprehensive wallet administration, multi-level affiliate marketing systems, and gamified reward loyalty programs.

---

## 🎨 Design System & Aesthetics
This platform is crafted to provide a high-end, elite gaming vibe through rigorous styling guidelines:
*   **Color Palette:**
    *   **Primary Maroon (`#800000`):** Evokes luxury, depth, and the feeling of high-stakes play.
    *   **Accent Gold (`#D4AF37` / `#F1D279`):** Symbolizes wealth, real rewards, and elite VIP status.
*   **Viewport Shell:** Optimized as a hybrid **mobile-first application**. On desktop displays, it renders in an elegant, centered smartphone mockup width (`450px`) with high-fidelity side widgets, while remaining fully responsive and immersive on mobile screens.
*   **Micro-Animations:** Fluid transitions, hover scaling, bouncing notification tickers, and animated game lists implemented using **Framer Motion** to deliver micro-interactions that feel alive and responsive.

---

## 🚀 Key Features

### 1. 🔐 Elite Authentication & Guarded Routing
*   **Full Multi-Step Flows:** Supports user Login, Account Sign-up (with mandatory/optional invitation code), OTP verification simulation, Forgot Password, and Reset Password.
*   **Client-Side Navigation Guards:** Implements reactive Route Protection through a global Zustand store; unauthorized navigation attempts to the lobby or wallet are intercepted and redirected to the login terminal with elegant toast notifications.

### 2. 🎮 Immersive Multi-Category Game Lobby
*   **Lottery (Color Prediction):** Feature-rich pages simulating popular games like **Win Go** (1min/3min prediction), **K3**, **5D**, and **Trx Win** using green/red/violet/number selectors.
*   **Live Dealer Casino:** Multi-provider cards supporting *Evolution Casino Live*, *DG Live Casino*, and *MG Grand Lounge*.
*   **JILI & PG Slots:** Grid systems sorted by providers displaying slots like *Money Coming*, *Fortune Gems*, and *Ganesha Gold* with custom slot reels, wild win indicators, and active player counts.
*   **Sportsbooks:** Odds tracking for CMD Sports, Saba Sports, and iMB Sports.
*   **Classic PVC/Cards:** Multiplayer interfaces simulating Rummy, Teen Patti, and Baccarat.
*   **Fishing & Mini-Games:** Action-oriented skill shooters (*Jackpot Fishing*) and crash-multipliers (*Aviator*, *Vortex*, *Mines*).

### 3. 💳 Advanced Wallet Administration
*   **Live Simulated Balance:** Real-time balance updates across games, bets, and wins.
*   **Payment Gateways:** Custom interfaces for UPI deposit processing and Direct Bank Wire payouts.
*   **Transaction Ledgers:** Color-coded list tracking deposits, withdrawals, and bonus payouts with dynamic status indicators (Success, Pending, Failed).
*   **Withdrawal Terminal:** High-performance form validating safe minimums, bank accounts, and transaction passcodes.

### 4. 📈 Dynamic Referral & Affiliate Hub
*   **Invitation System:** Unique, copy-to-clipboard referral codes (`382757617365`) and invite links.
*   **Promotional Multi-Tier stats:** Track direct invites, secondary subordinates, betting volume, and bonus earnings.
*   **Agent Commission Tiers:** Level breakdowns from Agent Level 1 through VIP Elite.

### 5. 🎁 Gamified Reward Center & Activities
*   **Daily Check-in Loyalty:** Calendar grid to log consecutive days of activity and claim progressive cash bonuses.
*   **Deposit Task Targets:** Interactive task lists matching wagering thresholds (e.g., betting ₹1,000 to redeem specific cash rewards).
*   **Activity Widget:** Center-docked header action displaying immediate cash rebates.

### 6. 🏆 Leaderboards & VIP Clubs
*   **Real-time Winner Boards:** Live marquee showing scrolling lists of recent bet winnings.
*   **High-Roller Spotlights:** Visual lists highlighting weekly top earners.

---

## 🛠️ Technology Stack
*   **Core:** [Next.js 16 (App Router)](https://nextjs.org/) for seamless server rendering, standard folder routes, and lightning-fast navigation.
*   **UI Engine:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/) for secure, strongly-typed component composition.
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility styling and state-of-the-art responsiveness.
*   **Animations:** [Framer Motion](https://www.framer.com/motion/) for premium entry animations and responsive element transitions.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) providing global reactive store `useAuthStore` managing:
    *   Authentication status (`isAuthenticated`)
    *   User Profile metadata (username, mobile number, VIP status)
    *   Real-time Wallet balances and history
*   **Components & Icons:** [Base UI](https://base-ui.com/) and [Lucide React](https://lucide.dev/) for robust, accessible UI primitives and clean vector icons.
*   **Alerting System:** [Sonner](https://react-hot-toast.com/) delivering aesthetic, rich-state toast systems.
*   **APIs & Networking:** [Axios](https://axios-http.com/) and [TanStack React Query v5](https://tanstack.com/query/latest) integrated for server synchronizations.
*   **Real-Time Capabilities:** [Socket.io-client](https://socket.io/) integration ready for multiplayer games.

---

## 📂 Project Directory Structure

```text
User Panel/
├── public/                # Static assets, local icons, and brand imagery
├── src/
│   ├── app/               # Next.js App Router (Page-based layouts)
│   │   ├── about/         # Static informational branding page
│   │   ├── auth/          # Authentication flows (login, signup, OTP, reset)
│   │   ├── games/         # Live play routes with dynamic game ID matchers
│   │   ├── leaderboard/   # VIP Club spotlights and rankings lists
│   │   ├── lobby/         # Main authenticated game portfolio menu
│   │   ├── profile/       # User profile details and VIP status trackers
│   │   ├── referrals/     # Promotion details and referral ledger sheets
│   │   ├── rewards/       # Progressive loyalty check-ins and wager tasks
│   │   ├── support/       # Customer service center (FAQ and Live Chat forms)
│   │   ├── tournaments/   # Active tournament logs
│   │   ├── wallet/        # Deposits, Withdrawals, and Ledger sheets
│   │   ├── layout.tsx     # Global CSS and metadata shells
│   │   └── page.tsx       # Public premium luxury landing presentation
│   ├── components/        # Shared components and design systems
│   │   ├── layout/        # Shared layout widgets (Top navbar, Bottom tab nav)
│   │   ├── ui/            # Shadcn primitives (buttons, inputs, sonner, tabs)
│   │   └── providers.tsx  # Next-Themes & Tanstack query context bindings
│   ├── constants/         # Game listing dictionaries and mock datasets
│   ├── store/             # Global stores (Zustand client contexts)
│   └── types/             # Global TypeScript configurations
├── postcss.config.mjs     # PostCSS configurations
├── tailwind.config.js     # Tailwind CSS styles and luxury color binds
├── tsconfig.json          # TypeScript workspace variables
└── package.json           # Node package scripts and dependency maps
```

---

## 💻 Local Setup & Execution

Follow these steps to run the user panel locally:

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or above recommended)
*   [npm](https://www.npmjs.com/) (v9.x or above)

### 2. Installation
Clone the repository, navigate to the `User Panel` folder, and install all dependencies:
```bash
cd "User Panel"
npm install
```

### 3. Running Development Server
Launch the local development environment:
```bash
npm run dev
```
Once started, open your web browser and navigate to:
*   **Local Host Portal:** [http://localhost:3000](http://localhost:3000)
*   *Note:* The development server supports hot-reloading (changes auto-apply on file edits).

### 4. Code Verification (Linting)
Ensure all TS files conform to stylistic guidelines:
```bash
npm run lint
```

### 5. Production Compilation
Build a production-optimized package bundle:
```bash
npm run build
```
To run the production bundle locally:
```bash
npm run start
```

---

## 🔒 Security & Performance Guidelines
*   **Client Verification:** Always check authorization statuses (`isAuthenticated`) before rendering authenticated UI routes in `/lobby`, `/wallet`, `/rewards`, `/referrals`, `/profile`.
*   **Visual Optimization:** Images are heavily compressed and lazy-loaded via Next.js optimizations to minimize First Contentful Paint (FCP) durations on standard 3G/4G connections.
*   **State Integrity:** Operations affecting user cash flows (Betting, Deposits, Withdrawals) update state using atomic transactions via the global state manager to protect balance accuracy.
=======
# Bull-Wave-Games
>>>>>>> origin/frontend-UAT
