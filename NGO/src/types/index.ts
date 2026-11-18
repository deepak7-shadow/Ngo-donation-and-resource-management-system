export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type CampaignCategory = 'water' | 'relief' | 'education' | 'health' | 'food' | 'shelter';
export type CampaignStatus = 'active' | 'completed' | 'urgent';

export interface Campaign {
  id: string;
  title: string;
  category: CampaignCategory;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donorsCount: number;
  startDate: string;
  endDate: string;
  urgency: UrgencyLevel;
  featured: boolean;
  beneficiaryCount: number;
  location: string;
  image: string;
  status: CampaignStatus;
}

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wire';
export type DonationFrequency = 'one-time' | 'monthly';

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorTaxId?: string; // PAN or 501(c)(3) tax ID
  amount: number;
  currency: string;
  frequency: DonationFrequency;
  campaignId: string;
  campaignName: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'completed' | 'processing' | 'failed';
  transactionRef: string;
  receiptNumber: string;
  createdAt: string;
  anonymous: boolean;
}

export type InventoryCategory = 'food' | 'medical' | 'blankets' | 'education' | 'shelter' | 'hygiene';
export type StockStatus = 'in-stock' | 'low-stock' | 'critical';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  warehouseLocation: string;
  lowStockThreshold: number;
  lastRestocked: string;
  costPerUnit: number;
  status: StockStatus;
}

export interface Dispatch {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  destinationCamp: string;
  volunteerAssigneeId: string;
  volunteerAssigneeName: string;
  dispatchDate: string;
  status: 'dispatched' | 'in-transit' | 'delivered';
  notes?: string;
}

export type AvailabilityType = 'weekdays' | 'weekends' | 'flexible' | 'emergency-only';
export type VolunteerStatus = 'active' | 'on-leave' | 'deployed';

export interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredHours: number;
  earnedAt?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  availability: AvailabilityType;
  totalHours: number;
  joinedDate: string;
  badges: string[]; // Badge names
  status: VolunteerStatus;
  avatar?: string;
}

export type ShiftType = 'field-mission' | 'food-drive' | 'disaster-response' | 'tutoring' | 'medical-camp';
export type ShiftStatus = 'open' | 'full' | 'in-progress' | 'completed' | 'cancelled';

export interface Shift {
  id: string;
  title: string;
  type: ShiftType;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  capacity: number;
  assignedVolunteerIds: string[];
  status: ShiftStatus;
  coordinatorName: string;
  notes?: string;
}

export type ExpenseCategory = 'direct-aid' | 'logistics' | 'admin' | 'medical' | 'education' | 'emergency';

export interface Expense {
  id: string;
  invoiceRef: string;
  date: string;
  category: ExpenseCategory;
  project: string;
  amount: number;
  vendor: string;
  verified: boolean;
  verifiedBy: string;
  description: string;
  receiptUrl?: string;
}

export type ActivityCategory = 'donation' | 'inventory' | 'volunteer' | 'expense' | 'campaign';

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  role: 'Donor' | 'Volunteer' | 'Admin' | 'System';
  details: string;
  timestamp: string;
  category: ActivityCategory;
}

export type ActiveRole = 'donor' | 'admin';

export interface FilterOptions {
  search?: string;
  category?: string;
  project?: string;
  status?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
