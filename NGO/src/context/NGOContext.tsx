import React, { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import type {
  Campaign,
  Donation,
  InventoryItem,
  Dispatch,
  Volunteer,
  Shift,
  Expense,
  ActivityLog,
  ActiveRole,
  ToastMessage,
  StockStatus,
} from '../types';
import {
  SEED_CAMPAIGNS,
  SEED_DONATIONS,
  SEED_INVENTORY,
  SEED_DISPATCHES,
  SEED_VOLUNTEERS,
  SEED_SHIFTS,
  SEED_EXPENSES,
  SEED_ACTIVITIES,
} from '../data/seedData';
import { generateId, generateReceiptNumber, generateTxnRef } from '../utils/id';

const STORAGE_KEY = 'HOPESPERE_STATE_V1';

interface NGOState {
  campaigns: Campaign[];
  donations: Donation[];
  inventory: InventoryItem[];
  dispatches: Dispatch[];
  volunteers: Volunteer[];
  shifts: Shift[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
  role: ActiveRole;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
}

type NGOAction =
  | { type: 'SET_ROLE'; payload: ActiveRole }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | {
      type: 'ADD_DONATION';
      payload: Omit<Donation, 'id' | 'paymentStatus' | 'transactionRef' | 'receiptNumber' | 'createdAt'>;
    }
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id'> }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_INVENTORY_ITEM'; payload: Omit<InventoryItem, 'id' | 'status'> }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | {
      type: 'DISPATCH_ITEM';
      payload: {
        itemId: string;
        quantity: number;
        destinationCamp: string;
        volunteerAssigneeId: string;
        notes?: string;
      };
    }
  | {
      type: 'RECEIVE_INKIND_DONATION';
      payload: {
        itemId: string;
        quantity: number;
        donorName: string;
        notes?: string;
      };
    }
  | { type: 'REGISTER_VOLUNTEER'; payload: Omit<Volunteer, 'id' | 'totalHours' | 'badges' | 'joinedDate'> }
  | { type: 'SIGNUP_FOR_SHIFT'; payload: { shiftId: string; volunteerId: string } }
  | { type: 'LOG_SHIFT_HOURS'; payload: { shiftId: string; volunteerId: string; hours: number } }
  | { type: 'ADD_CAMPAIGN'; payload: Omit<Campaign, 'id' | 'raisedAmount' | 'donorsCount'> }
  | { type: 'ADD_SHIFT'; payload: Omit<Shift, 'id' | 'assignedVolunteerIds'> }
  | { type: 'ADD_TOAST'; payload: Omit<ToastMessage, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'RESET_TO_SEED' };

function determineStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= threshold * 0.3) return 'critical';
  if (quantity <= threshold) return 'low-stock';
  return 'in-stock';
}

function computeBadges(totalHours: number): string[] {
  const badges: string[] = [];
  if (totalHours >= 10) badges.push('Bronze Helper');
  if (totalHours >= 25) badges.push('Silver Responder');
  if (totalHours >= 50) badges.push('Gold Champion');
  if (totalHours >= 100) badges.push('Platinum Luminary');
  return badges;
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('HOPESPERE_THEME');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function loadInitialState(): NGOState {
  const initialTheme = getInitialTheme();
  const defaultState: NGOState = {
    campaigns: SEED_CAMPAIGNS,
    donations: SEED_DONATIONS,
    inventory: SEED_INVENTORY,
    dispatches: SEED_DISPATCHES,
    volunteers: SEED_VOLUNTEERS,
    shifts: SEED_SHIFTS,
    expenses: SEED_EXPENSES,
    activityLogs: SEED_ACTIVITIES,
    role: 'donor',
    theme: initialTheme,
    toasts: [],
  };

  if (typeof window === 'undefined') return defaultState;

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return defaultState;
    const parsed = JSON.parse(serialized);
    if (
      Array.isArray(parsed.campaigns) &&
      Array.isArray(parsed.donations) &&
      Array.isArray(parsed.inventory) &&
      Array.isArray(parsed.volunteers)
    ) {
      return {
        ...defaultState,
        ...parsed,
        theme: initialTheme,
        toasts: [], // Don't persist toasts
      };
    }
    return defaultState;
  } catch (err) {
    console.warn('Failed to load HopeSphere state from localStorage, using seed data:', err);
    return defaultState;
  }
}

function ngoReducer(state: NGOState, action: NGOAction): NGOState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload };

    case 'SET_THEME': {
      try {
        localStorage.setItem('HOPESPERE_THEME', action.payload);
      } catch {
        // ignore
      }
      return { ...state, theme: action.payload };
    }

    case 'ADD_DONATION': {
      const now = new Date().toISOString();
      const receiptNumber = generateReceiptNumber();
      const txnRef = generateTxnRef();
      const donationId = generateId('DON');

      const newDonation: Donation = {
        ...action.payload,
        id: donationId,
        paymentStatus: 'completed',
        transactionRef: txnRef,
        receiptNumber,
        createdAt: now,
      };

      // Update matching campaign
      const updatedCampaigns = state.campaigns.map(camp => {
        if (camp.id === action.payload.campaignId) {
          return {
            ...camp,
            raisedAmount: camp.raisedAmount + action.payload.amount,
            donorsCount: camp.donorsCount + 1,
          };
        }
        return camp;
      });

      const newActivity: ActivityLog = {
        id: generateId('ACT'),
        action: 'Received Donation',
        user: action.payload.anonymous ? 'Anonymous Benefactor' : action.payload.donorName,
        role: 'Donor',
        details: `Donated $${action.payload.amount.toLocaleString()} to "${action.payload.campaignName}" (${receiptNumber}).`,
        timestamp: now,
        category: 'donation',
      };

      const toast: ToastMessage = {
        id: generateId('TST'),
        title: 'Donation Received!',
        message: `Thank you for your generous gift of $${action.payload.amount.toLocaleString()}. Receipt ${receiptNumber} generated.`,
        type: 'success',
      };

      return {
        ...state,
        donations: [newDonation, ...state.donations],
        campaigns: updatedCampaigns,
        activityLogs: [newActivity, ...state.activityLogs],
        toasts: [...state.toasts, toast],
      };
    }

    case 'ADD_EXPENSE': {
      const now = new Date().toISOString();
      const newExpense: Expense = {
        ...action.payload,
        id: generateId('EXP'),
      };

      const newActivity: ActivityLog = {
        id: generateId('ACT'),
        action: 'Expense Logged',
        user: 'Admin',
        role: 'Admin',
        details: `Recorded invoice ${newExpense.invoiceRef} ($${newExpense.amount.toLocaleString()}) under ${newExpense.category}.`,
        timestamp: now,
        category: 'expense',
      };

      const toast: ToastMessage = {
        id: generateId('TST'),
        title: 'Expense Logged',
        message: `Expense of $${newExpense.amount.toLocaleString()} added to transparency ledger.`,
        type: 'success',
      };

      return {
        ...state,
        expenses: [newExpense, ...state.expenses],
        activityLogs: [newActivity, ...state.activityLogs],
        toasts: [...state.toasts, toast],
      };
    }

    case 'DELETE_EXPENSE': {
      const target = state.expenses.find(e => e.id === action.payload);
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Expense Removed',
            user: 'Admin',
            role: 'Admin',
            details: `Removed expense invoice ${target?.invoiceRef || action.payload}.`,
            timestamp: new Date().toISOString(),
            category: 'expense',
          },
          ...state.activityLogs,
        ],
      };
    }

    case 'ADD_INVENTORY_ITEM': {
      const now = new Date().toISOString();
      const status = determineStockStatus(action.payload.quantity, action.payload.lowStockThreshold);
      const newItem: InventoryItem = {
        ...action.payload,
        id: generateId('INV'),
        status,
      };

      return {
        ...state,
        inventory: [newItem, ...state.inventory],
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Item Added to Inventory',
            user: 'Admin',
            role: 'Admin',
            details: `Cataloged ${newItem.quantity} ${newItem.unit} of "${newItem.name}".`,
            timestamp: now,
            category: 'inventory',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Inventory Item Added',
            message: `"${newItem.name}" added successfully.`,
            type: 'success',
          },
        ],
      };
    }

    case 'UPDATE_INVENTORY_ITEM': {
      const updatedStatus = determineStockStatus(
        action.payload.quantity,
        action.payload.lowStockThreshold
      );
      const updatedItem = { ...action.payload, status: updatedStatus };

      return {
        ...state,
        inventory: state.inventory.map(item => (item.id === action.payload.id ? updatedItem : item)),
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Inventory Updated',
            user: 'Admin',
            role: 'Admin',
            details: `Updated stock level for "${updatedItem.name}" to ${updatedItem.quantity} ${updatedItem.unit}.`,
            timestamp: new Date().toISOString(),
            category: 'inventory',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Inventory Updated',
            message: `"${updatedItem.name}" updated successfully.`,
            type: 'info',
          },
        ],
      };
    }

    case 'DELETE_INVENTORY_ITEM': {
      const target = state.inventory.find(i => i.id === action.payload);
      return {
        ...state,
        inventory: state.inventory.filter(i => i.id !== action.payload),
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Item Removed',
            user: 'Admin',
            role: 'Admin',
            details: `Removed "${target?.name || action.payload}" from inventory.`,
            timestamp: new Date().toISOString(),
            category: 'inventory',
          },
          ...state.activityLogs,
        ],
      };
    }

    case 'DISPATCH_ITEM': {
      const { itemId, quantity, destinationCamp, volunteerAssigneeId, notes } = action.payload;
      const item = state.inventory.find(i => i.id === itemId);
      const volunteer = state.volunteers.find(v => v.id === volunteerAssigneeId);

      if (!item) return state;

      // Over-dispatch prevention check
      if (quantity > item.quantity) {
        return {
          ...state,
          toasts: [
            ...state.toasts,
            {
              id: generateId('TST'),
              title: 'Dispatch Blocked',
              message: `Cannot dispatch ${quantity} ${item.unit}. Only ${item.quantity} available in stock.`,
              type: 'error',
            },
          ],
        };
      }

      const updatedQuantity = item.quantity - quantity;
      const updatedStatus = determineStockStatus(updatedQuantity, item.lowStockThreshold);
      const updatedItem: InventoryItem = {
        ...item,
        quantity: updatedQuantity,
        status: updatedStatus,
      };

      const newDispatch: Dispatch = {
        id: generateId('DSP'),
        itemId: item.id,
        itemName: item.name,
        quantity,
        unit: item.unit,
        destinationCamp,
        volunteerAssigneeId,
        volunteerAssigneeName: volunteer?.name || 'Assigned Volunteer',
        dispatchDate: new Date().toISOString().split('T')[0],
        status: 'dispatched',
        notes,
      };

      return {
        ...state,
        inventory: state.inventory.map(i => (i.id === itemId ? updatedItem : i)),
        dispatches: [newDispatch, ...state.dispatches],
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Dispatched Supplies',
            user: volunteer?.name || 'Logistics Coordinator',
            role: 'Volunteer',
            details: `Dispatched ${quantity} ${item.unit} of "${item.name}" to ${destinationCamp}.`,
            timestamp: new Date().toISOString(),
            category: 'inventory',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Dispatch Recorded',
            message: `${quantity} ${item.unit} assigned to ${volunteer?.name || 'volunteer'}.`,
            type: 'success',
          },
        ],
      };
    }

    case 'RECEIVE_INKIND_DONATION': {
      const { itemId, quantity, donorName, notes } = action.payload;
      const item = state.inventory.find(i => i.id === itemId);
      if (!item) return state;

      const newQty = item.quantity + quantity;
      const newStatus = determineStockStatus(newQty, item.lowStockThreshold);
      const updatedItem: InventoryItem = {
        ...item,
        quantity: newQty,
        lastRestocked: new Date().toISOString().split('T')[0],
        status: newStatus,
      };

      return {
        ...state,
        inventory: state.inventory.map(i => (i.id === itemId ? updatedItem : i)),
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Received In-Kind Donation',
            user: donorName,
            role: 'Donor',
            details: `Received ${quantity} ${item.unit} of "${item.name}". ${notes || ''}`,
            timestamp: new Date().toISOString(),
            category: 'inventory',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'In-Kind Donation Logged',
            message: `Added ${quantity} ${item.unit} of "${item.name}" from ${donorName}.`,
            type: 'success',
          },
        ],
      };
    }

    case 'REGISTER_VOLUNTEER': {
      const now = new Date().toISOString();
      const newVolunteer: Volunteer = {
        ...action.payload,
        id: generateId('VOL'),
        totalHours: 0,
        badges: [],
        joinedDate: now.split('T')[0],
      };

      return {
        ...state,
        volunteers: [newVolunteer, ...state.volunteers],
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'New Volunteer Registered',
            user: newVolunteer.name,
            role: 'Volunteer',
            details: `${newVolunteer.name} registered with skills: ${newVolunteer.skills.join(', ')}.`,
            timestamp: now,
            category: 'volunteer',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Welcome to HopeSphere!',
            message: `${newVolunteer.name} has been onboarded to our volunteer workforce.`,
            type: 'success',
          },
        ],
      };
    }

    case 'SIGNUP_FOR_SHIFT': {
      const { shiftId, volunteerId } = action.payload;
      const shift = state.shifts.find(s => s.id === shiftId);
      const volunteer = state.volunteers.find(v => v.id === volunteerId);

      if (!shift || !volunteer) return state;

      // Duplicate sign-up check
      if (shift.assignedVolunteerIds.includes(volunteerId)) {
        return {
          ...state,
          toasts: [
            ...state.toasts,
            {
              id: generateId('TST'),
              title: 'Already Registered',
              message: `${volunteer.name} is already assigned to this shift.`,
              type: 'warning',
            },
          ],
        };
      }

      // Capacity check
      if (shift.assignedVolunteerIds.length >= shift.capacity) {
        return {
          ...state,
          toasts: [
            ...state.toasts,
            {
              id: generateId('TST'),
              title: 'Shift Full',
              message: `This mission has reached its maximum capacity of ${shift.capacity} volunteers.`,
              type: 'error',
            },
          ],
        };
      }

      const updatedAssigned = [...shift.assignedVolunteerIds, volunteerId];
      const isFull = updatedAssigned.length >= shift.capacity;
      const updatedShift: Shift = {
        ...shift,
        assignedVolunteerIds: updatedAssigned,
        status: isFull ? 'full' : 'open',
      };

      return {
        ...state,
        shifts: state.shifts.map(s => (s.id === shiftId ? updatedShift : s)),
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Volunteer Enrolled in Shift',
            user: volunteer.name,
            role: 'Volunteer',
            details: `Signed up for "${shift.title}" scheduled on ${shift.date}.`,
            timestamp: new Date().toISOString(),
            category: 'volunteer',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Enrolled in Mission',
            message: `Assigned ${volunteer.name} to "${shift.title}".`,
            type: 'success',
          },
        ],
      };
    }

    case 'LOG_SHIFT_HOURS': {
      const { shiftId, volunteerId, hours } = action.payload;
      const shift = state.shifts.find(s => s.id === shiftId);
      const volunteer = state.volunteers.find(v => v.id === volunteerId);

      if (!volunteer) return state;

      const newHours = volunteer.totalHours + hours;
      const updatedBadges = computeBadges(newHours);
      const hasNewBadge = updatedBadges.length > volunteer.badges.length;

      const updatedVolunteer: Volunteer = {
        ...volunteer,
        totalHours: newHours,
        badges: updatedBadges,
      };

      const toastMessage = hasNewBadge
        ? `Logged ${hours}h for ${volunteer.name}. New milestone unlocked: ${updatedBadges[updatedBadges.length - 1]}!`
        : `Logged ${hours}h for ${volunteer.name}. Total: ${newHours}h.`;

      return {
        ...state,
        volunteers: state.volunteers.map(v => (v.id === volunteerId ? updatedVolunteer : v)),
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Logged Volunteer Hours',
            user: shift?.coordinatorName || 'Coordinator',
            role: 'Admin',
            details: `Logged ${hours} service hours for ${volunteer.name} (Mission: ${shift?.title || 'Relief'}).`,
            timestamp: new Date().toISOString(),
            category: 'volunteer',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: hasNewBadge ? 'Badge Unlocked!' : 'Hours Logged',
            message: toastMessage,
            type: 'success',
          },
        ],
      };
    }

    case 'ADD_CAMPAIGN': {
      const newCampaign: Campaign = {
        ...action.payload,
        id: generateId('CMP'),
        raisedAmount: 0,
        donorsCount: 0,
      };

      return {
        ...state,
        campaigns: [newCampaign, ...state.campaigns],
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Created Campaign',
            user: 'Admin',
            role: 'Admin',
            details: `Launched new campaign "${newCampaign.title}" with a target of $${newCampaign.goalAmount.toLocaleString()}.`,
            timestamp: new Date().toISOString(),
            category: 'campaign',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Campaign Launched',
            message: `"${newCampaign.title}" is now live and accepting donations.`,
            type: 'success',
          },
        ],
      };
    }

    case 'ADD_SHIFT': {
      const newShift: Shift = {
        ...action.payload,
        id: generateId('SHF'),
        assignedVolunteerIds: [],
      };

      return {
        ...state,
        shifts: [newShift, ...state.shifts],
        activityLogs: [
          {
            id: generateId('ACT'),
            action: 'Scheduled Shift',
            user: newShift.coordinatorName,
            role: 'Admin',
            details: `Posted "${newShift.title}" on ${newShift.date} for ${newShift.capacity} volunteers.`,
            timestamp: new Date().toISOString(),
            category: 'volunteer',
          },
          ...state.activityLogs,
        ],
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'Mission Scheduled',
            message: `"${newShift.title}" is open for volunteer registration.`,
            type: 'success',
          },
        ],
      };
    }

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { ...action.payload, id: generateId('TST') }],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload),
      };

    case 'RESET_TO_SEED': {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      return {
        ...state,
        campaigns: SEED_CAMPAIGNS,
        donations: SEED_DONATIONS,
        inventory: SEED_INVENTORY,
        dispatches: SEED_DISPATCHES,
        volunteers: SEED_VOLUNTEERS,
        shifts: SEED_SHIFTS,
        expenses: SEED_EXPENSES,
        activityLogs: SEED_ACTIVITIES,
        toasts: [
          ...state.toasts,
          {
            id: generateId('TST'),
            title: 'State Reset',
            message: 'HopeSphere data restored to original seed state.',
            type: 'info',
          },
        ],
      };
    }

    default:
      return state;
  }
}

interface NGOContextType {
  state: NGOState;
  dispatch: React.Dispatch<NGOAction>;
  telemetry: {
    totalFundsRaised: number;
    totalReliefDistributed: number;
    activeVolunteersCount: number;
    totalBeneficiaries: number;
    villagesImpacted: number;
    directAidPercentage: number;
    logisticsPercentage: number;
    adminPercentage: number;
  };
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

export function NGOProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ngoReducer, null, loadInitialState);

  // Sync to localStorage
  useEffect(() => {
    try {
      const stateToPersist = {
        campaigns: state.campaigns,
        donations: state.donations,
        inventory: state.inventory,
        dispatches: state.dispatches,
        volunteers: state.volunteers,
        shifts: state.shifts,
        expenses: state.expenses,
        activityLogs: state.activityLogs,
        role: state.role,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (err) {
      console.warn('Failed to sync state to localStorage:', err);
    }
  }, [state]);

  // Sync theme attribute on document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Derived Telemetry
  const telemetry = useMemo(() => {
    const totalFundsRaised = state.donations.reduce((acc, d) => acc + d.amount, 0);

    const totalReliefDistributed = state.dispatches.reduce((acc, d) => acc + d.quantity, 0);

    const activeVolunteersCount = state.volunteers.filter(v => v.status === 'active' || v.status === 'deployed').length;

    const totalBeneficiaries = state.campaigns.reduce((acc, c) => acc + c.beneficiaryCount, 0);

    // Estimate villages impacted: based on locations, borewells, clinics and camps
    const villagesImpacted = 84 + state.dispatches.length * 2;

    // Financial breakdown percentages
    const totalExpense = state.expenses.reduce((acc, e) => acc + e.amount, 0);
    const directAidExpense = state.expenses
      .filter(e => e.category === 'direct-aid' || e.category === 'medical' || e.category === 'education' || e.category === 'emergency')
      .reduce((acc, e) => acc + e.amount, 0);
    const logisticsExpense = state.expenses
      .filter(e => e.category === 'logistics')
      .reduce((acc, e) => acc + e.amount, 0);
    const adminExpense = state.expenses
      .filter(e => e.category === 'admin')
      .reduce((acc, e) => acc + e.amount, 0);

    const directAidPercentage = totalExpense > 0 ? Math.round((directAidExpense / totalExpense) * 100) : 86;
    const logisticsPercentage = totalExpense > 0 ? Math.round((logisticsExpense / totalExpense) * 100) : 9;
    const adminPercentage = totalExpense > 0 ? Math.round((adminExpense / totalExpense) * 100) : 5;

    return {
      totalFundsRaised,
      totalReliefDistributed,
      activeVolunteersCount,
      totalBeneficiaries,
      villagesImpacted,
      directAidPercentage,
      logisticsPercentage,
      adminPercentage,
    };
  }, [state.donations, state.dispatches, state.volunteers, state.campaigns, state.expenses]);

  return (
    <NGOContext.Provider value={{ state, dispatch, telemetry }}>
      {children}
    </NGOContext.Provider>
  );
}

export function useNGO(): NGOContextType {
  const context = useContext(NGOContext);
  if (!context) {
    throw new Error('useNGO must be used within an NGOProvider');
  }
  return context;
}
