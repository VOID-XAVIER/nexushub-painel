import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Company, FinancialRecord, UserWithCompany } from '../types';
import { supabase } from '../lib/supabase';

interface CreateCompanyData {
  name: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  class?: string;
  whatsappNumber?: string;
}

interface DataContextType {
  companies: Company[];
  getCompany: (id: string) => Company | undefined;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  toggleCompanyStatus: (id: string) => Promise<void>;
  getCompanyUsers: (companyId: string) => UserWithCompany[];
  users: UserWithCompany[];
  getUser: (id: string) => UserWithCompany | undefined;
  getUsersByRole: (role: UserWithCompany['role']) => UserWithCompany[];
  createUser: (data: Omit<UserWithCompany, 'id' | 'createdAt' | 'isOnline'>) => Promise<void>;
  updateUserStatus: (id: string, isActive: boolean) => Promise<void>;
  toggleUserOnline: (id: string) => Promise<void>;
  financialRecords: FinancialRecord[];
  getStats: () => {
    totalCompanies: number;
    activeCompanies: number;
    inactiveCompanies: number;
    totalUsers: number;
    totalMasterStaff: number;
  };
  getCompanyStats: (companyId: string) => {
    totalSellers: number;
    onlineSellers: number;
    offlineSellers: number;
  };
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserWithCompany[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      const [{ data: companiesData }, { data: usersData }, { data: financialData }] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('users').select('*'),
        supabase.from('financial_records').select('*'),
      ]);

      if (companiesData) setCompanies(companiesData.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.is_active,
        createdAt: c.created_at,
        adminId: c.admin_id,
        class: c.class,
        whatsappNumber: c.whatsapp_number,
      })));

      if (usersData) setUsers(usersData.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        companyId: u.company_id,
        isOnline: u.is_online,
        isActive: u.is_active,
        createdAt: u.created_at,
        monthlyGoal: u.monthly_goal,
      })));

      if (financialData) setFinancialRecords(financialData.map(f => ({
        id: f.id,
        companyId: f.company_id,
        companyName: f.company_name,
        amount: f.amount,
        status: f.status,
        dueDate: f.due_date,
      })));
    }

    loadData();
  }, []);

  const getCompany = useCallback((id: string) => {
    return companies.find(c => c.id === id);
  }, [companies]);

  const createCompany = useCallback(async (data: CreateCompanyData) => {
    const companyId = `company-${Date.now()}`;
    const adminId = `user-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { error: companyError } = await supabase.from('companies').insert({
      id: companyId,
      name: data.name,
      is_active: true,
      created_at: createdAt,
      admin_id: adminId,
      class: data.class,
      whatsapp_number: data.whatsappNumber,
    });
    console.log('COMPANY ERROR:', companyError);

    const { error: userError } = await supabase.from('users').insert({
      id: adminId,
      name: data.adminName,
      email: data.adminEmail,
      password: data.adminPassword,
      role: 'company_admin',
      company_id: companyId,
      is_online: false,
      is_active: true,
      created_at: createdAt,
    });
    console.log('USER ERROR:', userError);

    await supabase.from('financial_records').insert({
      id: `fin-${Date.now()}`,
      company_id: companyId,
      company_name: data.name,
      amount: 299.90,
      status: 'pending',
      due_date: dueDate,
    });

    setCompanies(prev => [...prev, {
      id: companyId,
      name: data.name,
      isActive: true,
      createdAt,
      adminId,
      class: data.class,
      whatsappNumber: data.whatsappNumber,
    }]);
    setUsers(prev => [...prev, {
      id: adminId,
      name: data.adminName,
      email: data.adminEmail,
      password: data.adminPassword,
      role: 'company_admin',
      companyId,
      isOnline: false,
      isActive: true,
      createdAt,
    }]);
    setFinancialRecords(prev => [...prev, {
      id: `fin-${Date.now()}`,
      companyId,
      companyName: data.name,
      amount: 299.90,
      status: 'pending',
      dueDate,
    }]);
  }, []);

  const toggleCompanyStatus = useCallback(async (id: string) => {
    const company = companies.find(c => c.id === id);
    if (!company) return;
    await supabase.from('companies').update({ is_active: !company.isActive }).eq('id', id);
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }, [companies]);

  const getCompanyUsers = useCallback((companyId: string) => {
    return users.filter(u => u.companyId === companyId);
  }, [users]);

  const getUser = useCallback((id: string) => {
    return users.find(u => u.id === id);
  }, [users]);

  const getUsersByRole = useCallback((role: UserWithCompany['role']) => {
    return users.filter(u => u.role === role);
  }, [users]);

  const createUser = useCallback(async (data: Omit<UserWithCompany, 'id' | 'createdAt' | 'isOnline'>) => {
    const id = `user-${Date.now()}`;
    const createdAt = new Date().toISOString().split('T')[0];

    await supabase.from('users').insert({
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      company_id: data.companyId,
      is_online: false,
      is_active: data.isActive,
      created_at: createdAt,
      monthly_goal: data.monthlyGoal,
    });

    setUsers(prev => [...prev, { ...data, id, isOnline: false, createdAt }]);
  }, []);

  const updateUserStatus = useCallback(async (id: string, isActive: boolean) => {
    await supabase.from('users').update({ is_active: isActive }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
  }, []);

  const toggleUserOnline = useCallback(async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    await supabase.from('users').update({ is_online: !user.isOnline }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isOnline: !u.isOnline } : u));
  }, [users]);

  const getStats = useCallback(() => {
    const activeCompanies = companies.filter(c => c.isActive).length;
    return {
      totalCompanies: companies.length,
      activeCompanies,
      inactiveCompanies: companies.length - activeCompanies,
      totalUsers: users.length,
      totalMasterStaff: users.filter(u => u.role === 'master_staff').length,
    };
  }, [companies, users]);

  const getCompanyStats = useCallback((companyId: string) => {
    const sellers = users.filter(u => u.companyId === companyId && u.role === 'seller');
    const onlineSellers = sellers.filter(s => s.isOnline).length;
    return {
      totalSellers: sellers.length,
      onlineSellers,
      offlineSellers: sellers.length - onlineSellers,
    };
  }, [users]);

  return (
    <DataContext.Provider value={{
      companies,
      getCompany,
      createCompany,
      toggleCompanyStatus,
      getCompanyUsers,
      users,
      getUser,
      getUsersByRole,
      createUser,
      updateUserStatus,
      toggleUserOnline,
      financialRecords,
      getStats,
      getCompanyStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}