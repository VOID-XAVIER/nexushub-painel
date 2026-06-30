export interface Company {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  adminId: string;
  class?: string;
  whatsappNumber?: string;
}

export interface FinancialRecord {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

export interface UserWithCompany {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'master_root' | 'master_staff' | 'company_admin' | 'seller';
  companyId: string | null;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
  monthlyGoal?: number;
}