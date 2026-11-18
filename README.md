<<<<<<< HEAD
# Ngo-donation-and-resource-management-system
=======
# HopeSphere — NGO Donation & Resource Management System

**HopeSphere** is a production-grade, full-stack humanitarian management platform built with **React 19**, **Vite**, and **TypeScript (strict mode)**. It pairs radical financial transparency and Section 80G tax receipt generation with real-time disaster relief logistics, warehouse inventory controls, and volunteer workforce dispatching.

---

## 🌟 Key Capabilities & Feature Modules

### 1. Public & Donor Impact Hub
- **Live Humanitarian Telemetry**: Animated count-up metrics for total funds raised, relief kits distributed, active field volunteers, and villages impacted—derived dynamically from state.
- **6 Verified Relief Campaigns**: Clean Water Initiative, Emergency Winter Relief, Child STEM Labs, Mobile Maternal Health, Malnutrition Intervention, and Disaster Emergency Shelters.
- **Multi-Step Donation Flow**:
  - Frequency toggle: One-time gift vs. monthly recurring sustainer (with 3x impact multiplier).
  - Preset contribution tiers ($25, $50, $100, $250, $500, $1,000) with dynamic impact statements (e.g., "$50 feeds a displaced family of 4 for a month").
  - Donor details capture with optional PAN / Tax ID for official 80G / 501(c)(3) tax deductions, plus anonymous donor mode.
  - Multi-channel payment simulator: Credit/Debit Card, UPI (VPA & QR simulator), NetBanking, and Wire Transfer with simulated authorization delay and inline validations.
- **Instant Section 80G Tax Receipt**:
  - Official certification document with unique receipt number (`HS-80G-YYYY-XXXXX`), transaction reference, and amount in words.
  - Dedicated print stylesheet (`@media print`) and instant CSV export.

### 2. Financial Transparency & Audit Ledger
- **Dynamic Fund Allocation Donut Chart** (via Recharts):
  - **86% Direct Aid** (relief items, borewells, mobile clinics, student tablets).
  - **9% Last-Mile Logistics** (convoys, cold-chain solar vaccine coolers, river barges).
  - **5% Statutory Audits & Governance** (external audit certifications, legal filings).
- **Public Expenditure Ledger**:
  - Searchable by invoice reference, supplier, project, or description.
  - Multi-filtering by category, project, and start/end dates with sorting and pagination.
  - Verified audit badges with inspector names.
- **Statutory Audit Statement & Reconciliation**:
  - Reconciles total cash inflows against expenditures, displaying net field reserves in escrow.
  - One-click export to CSV and print-ready summary.

### 3. Resource & Relief Inventory Management
- **Catalog Management**: Tracks quantities, units (kits, boxes, units, kg, sheets), warehouse locations, low-stock thresholds, and cost valuations across 6 categories.
- **Proactive Low-Stock Alerts**: Visual warnings and quick-replenish actions for items dipping below safety buffers.
- **Over-Dispatch Prevention Shield**:
  - Validates requested dispatches against real-time physical inventory.
  - **Hard blocks** attempts to dispatch more units than available in stock.
  - Automatically decrements inventory, updates health status, and writes a distribution entry to the manifest and activity log.
- **In-Kind Donation Staging**: Allows logging of physical supplies from corporate donors or bakeries to restock depleted items.

### 4. Volunteer Workforce & Shift Board
- **Personnel Directory**: Profiles with skills tags, availability schedules, verified hours, and service badges.
- **Automated Milestone Badge Awards**:
  - 🥉 **Bronze Helper**: Awarded at 10 hours.
  - 🥈 **Silver Responder**: Awarded at 25 hours.
  - 🥇 **Gold Champion**: Awarded at 50 hours.
  - 💎 **Platinum Luminary**: Awarded at 100 hours.
- **Mission Shift Board**:
  - Real-time crew capacity gauges (e.g., 4 / 10 volunteers filled).
  - Anti-double-booking check: prevents a volunteer from registering twice for the same shift.
  - Capacity enforcement: automatically marks shifts full when headcount limit is met.
  - Shift coordinator check-in and service hours logger with instant badge unlocks.

### 5. Admin Command Center
- **Executive Analytics**:
  - 5-month capital inflow vs. field outflow cashflow chart.
  - Monthly recurring sustainer retention rate (94.6%).
  - Volunteer deployment hours by primary discipline.
  - Inventory pressure index.
- **Incident Commander Quick Action Bar**: Quick-trigger buttons for logging emergency donations, dispatching supplies, launching urgent campaigns, or posting shifts.
- **Full Mutation Activity Audit Log**: Records every state change (who, what, when, actor role, details) with CSV export capability.

---

## 🎨 Design System & Accessibility

- **Palette**: Deep Emerald (`#059669`) / Teal (`#0d9488`) primary, Warm Amber (`#f59e0b`) accent, and Slate neutrals.
- **Pure Custom CSS**: Zero utility bloat, built in `src/index.css` with CSS custom properties (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`).
- **Dark & Light Modes**: Full dual-theme system toggled via `[data-theme]`, persisted to `localStorage`, with automatic `prefers-color-scheme` detection on initial visit.
- **Glassmorphism**: Backdrop blur cards with solid color fallbacks.
- **Fluid Typography**: Uses `clamp()` scales with **Plus Jakarta Sans** (headings) and **Inter** (body) loaded via Google Fonts.
- **WCAG AA Compliance**: Keyboard navigation, focus rings (`:focus-visible`), aria labels, escape-key modal dismissals with focus trapping, and semantic color contrasts.
- **Print Optimization**: High-fidelity `@media print` rules hiding navigation and buttons to produce clean 80G receipts and statutory balance sheets.

---

## ⚙️ Architecture & State Management

```
NGO/
├── index.html                    # SEO meta tags, Google Fonts (Plus Jakarta Sans + Inter)
├── package.json, vite.config.ts  # Vite build configuration with React 19 & TypeScript strict mode
├── tsconfig.json                 # Strict compiler options
├── src/
│   ├── main.tsx                  # React 19 entrypoint
│   ├── App.tsx                   # Master layout with React.lazy code-splitting
│   ├── index.css                 # Custom CSS design system, variables, micro-animations
│   ├── types/                    # Domain models (Donation, Campaign, InventoryItem, etc.)
│   ├── data/seedData.ts          # Rich initial seed data (26 donations, 6 campaigns, 31 expenses, 21 items, 16 volunteers, 12 shifts)
│   ├── context/NGOContext.tsx    # useReducer state with versioned localStorage synchronization
│   ├── utils/                    # Receipt generator, number-to-words, CSV exports, date formatters
│   ├── components/
│   │   ├── common/               # Navbar, Footer, Modal, StatsCard, ProgressBar, Badge, Toast, EmptyState
│   │   ├── public/               # HeroBanner, CampaignList, DonationModal, ImpactStats, ReceiptModal
│   │   ├── financial/            # FundAllocationChart, TransparencyLedger, ExpenseModal, AuditReport
│   │   ├── inventory/            # StockTable, AddItemModal, DispatchModal, LowStockAlerts, InKindModal
│   │   ├── volunteers/           # VolunteerList, ShiftScheduler, RegisterVolunteerModal, HoursTracker
│   │   └── admin/                # AdminOverview, MetricsOverview, QuickActionBar, ActivityLog
│   └── assets/                   # High-res SVG sector illustrations & fallbacks
```

### State Flow & Persistence
- Managed via `NGOContext` with a typed reducer (`useReducer`).
- Synced to `localStorage` under the versioned key `HOPESPERE_STATE_V1`.
- Built-in corruption safety: if `localStorage` is malformed, missing, or corrupted, the system safely falls back to the rich seed data without throwing errors.
- **Reset Demo Data**: A "Reset Demo Seed Data" button is available in the footer to restore initial state at any time.

---

## 🔐 Demo Role Switch (Important Note)

In the top right navigation bar, a role toggle is available: **Donor** vs. **Admin**.
- **Donor Mode**: Surfaces the public-facing donor impact hub, campaigns, donation flow, and read-only transparency ledger.
- **Admin Mode**: Unlocks the Executive Admin Command Center, Incident Quick Action Bar, Add Expense controls, Dispatch tools, and mutation logs.

> **Note**: This toggle is intended for demo and evaluation purposes to easily demonstrate both public donor and back-office administrative workflows without backend authentication.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v24`)
- npm `v9+` or `v11+`

### Installation & Run

```bash
# 1. Navigate to the project folder
cd NGO

# 2. Install dependencies (if not already installed)
npm install

# 3. Start local development server
npm run dev
```

### Verification & Production Build

```bash
# Run strict TypeScript check (zero errors)
npx tsc --noEmit

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 💡 Decisions Made During Development

1. **Vite Code-Splitting with `React.lazy()` & `Suspense`**:
   Heavy views (`TransparencyLedger`, `AdminOverview`, `StockTable`, `DonationModal`, `ReceiptModal`) are lazy-loaded with skeleton placeholders to keep the initial JavaScript payload under 320 kB and optimize Core Web Vitals.
2. **Offline-Safe Vector Art**:
   In addition to high-resolution humanitarian photographs, bespoke SVGs were generated for all 6 relief domains in `src/assets/`. If network conditions fail, `<img>` tags gracefully fall back to local SVG artwork.
3. **Number-to-Words Receipt Utility**:
   Implemented a dedicated algorithmic number-to-words generator in `src/utils/receiptGenerator.ts` to ensure 80G certificates display statutory financial wording (e.g., *"Two Thousand Five Hundred Dollars Only"*).
4. **Hard-Gate Over-Dispatch Protection**:
   The `DISPATCH_ITEM` reducer action checks `requestedQuantity > currentStock` and dispatches an error toast rather than allowing negative warehouse stock levels.
5. **Anti-Double-Booking**:
   The shift registration system validates `shift.assignedVolunteerIds.includes(volunteerId)` and disables already-registered volunteers in the dropdown.
>>>>>>> e2e8b2a (feat: complete HopeSphere NGO donation and resource management system)
