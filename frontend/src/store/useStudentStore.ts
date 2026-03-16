import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export interface Student {
  id: number;
  matricule: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  grade: { id: number; name: string };
  status: 'active' | 'graduated' | 'transferred' | 'suspended';
  enrollment_date: string;
}

interface StudentState {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  fetchStudents: (search?: string) => Promise<void>;
  addStudent: (data: Partial<Student>) => Promise<Student>;
  updateStudent: (id: number, data: Partial<Student>) => Promise<Student>;
  deleteStudent: (id: number) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  isLoading: false,
  error: null,

  fetchStudents: async (search = '') => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get('/students', { params: { search } });
      set({ students: res.data.data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch students' });
      throw err;
    }
  },

  addStudent: async (data) => {
    try {
      const res = await apiClient.post('/students', data);
      const newStudent = res.data.data;
      set(state => ({ students: [newStudent, ...state.students] }));
      return newStudent;
    } catch (err: any) {
      throw err;
    }
  },

  updateStudent: async (id, data) => {
    try {
      const res = await apiClient.put(`/students/${id}`, data);
      const updatedStudent = res.data.data;
      set(state => ({
        students: state.students.map(s => s.id === id ? updatedStudent : s)
      }));
      return updatedStudent;
    } catch (err: any) {
      throw err;
    }
  },

  deleteStudent: async (id) => {
    try {
      await apiClient.delete(`/students/${id}`);
      set(state => ({
        students: state.students.filter(s => s.id !== id)
      }));
    } catch (err: any) {
      throw err;
    }
  }
}));
