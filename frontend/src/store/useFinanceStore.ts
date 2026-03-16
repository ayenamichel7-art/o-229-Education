import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export interface Payment {
  id: number;
  student_name: string;
  student_id: number;
  amount: number;
  amount_paid: number;
  type: string;
  payment_method: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

interface FinancialSummary {
  total_invoiced: number;
  total_collected: number;
  total_pending: number;
  total_overdue: number;
  collection_rate: number;
  payment_count: number;
}

interface FinanceState {
  payments: Payment[];
  summary: FinancialSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  recordPayment: (data: any) => Promise<Payment>;
  processInstallment: (id: number, amount: number, method: string) => Promise<Payment>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  payments: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/payments');
      set({ payments: res.data.data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch payments' });
      throw err;
    }
  },

  fetchSummary: async () => {
    try {
      const res = await apiClient.get('/payments-summary');
      set({ summary: res.data.data });
    } catch (err) {
      console.error('Failed to fetch financial summary', err);
    }
  },

  recordPayment: async (data) => {
    try {
      const res = await apiClient.post('/payments', data);
      const newPayment = res.data.data;
      set(state => ({ payments: [newPayment, ...state.payments] }));
      get().fetchSummary();
      return newPayment;
    } catch (err: any) {
      throw err;
    }
  },

  processInstallment: async (id, amount, method) => {
    try {
      const res = await apiClient.post(`/payments/${id}/installment`, { amount, payment_method: method });
      const updatedPayment = res.data.data;
      set(state => ({
        payments: state.payments.map(p => p.id === id ? updatedPayment : p)
      }));
      get().fetchSummary();
      return updatedPayment;
    } catch (err: any) {
      throw err;
    }
  }
}));
