import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { saveLogToFirebase, subscribeToLogs } from '@/services/firebaseConfig';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

export interface Research {
  id: string;
  name: string;
  deadline?: string;
}

export interface StudentOrder {
  productId: string;
  selected: boolean;
  paid: boolean;
  delivered: boolean;
}

export interface StudentResearch {
  researchId: string;
  submitted: boolean;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  fileUri?: string;
}

export interface Student {
  id: string;
  name: string;
  section: string;
  phone: string;
  academicYear: '25' | '26';
  orders: StudentOrder[];
  researches: StudentResearch[];
  notes: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export type LogType = 'student_added' | 'student_updated' | 'student_deleted' | 'payment' | 'delivery' | 'research_submitted' | 'product_added' | 'product_updated' | 'product_deleted' | 'admin_login' | 'admin_logout' | 'settings_changed';

export interface AppLog {
  id: string;
  type: LogType;
  description: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface AppSettings {
  universityLogo?: string;
  collegeLogo?: string;
  bannerImage?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  customTexts?: {
    appTitle?: string;
    collegeName?: string;
    departmentName?: string;
  };
  googleEmail?: string;
}

interface AppState {
  isAdmin: boolean;
  students: Student[];
  products: Product[];
  researches: Research[];
  messages: Message[];
  logs: AppLog[];
  settings: AppSettings;
  currentStudentId: string | null;
}

interface AppContextType extends AppState {
  login: (password: string) => boolean;
  googleLogin: (email: string) => void;
  logout: () => void;
  setCurrentStudent: (id: string | null) => void;
  addStudent: (student: Omit<Student, 'id' | 'orders' | 'researches' | 'notes' | 'createdAt'> & { academicYear: '25' | '26' }) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkAddStudents: (names: string[]) => void;
  updateStudentOrder: (studentId: string, productId: string, field: 'selected' | 'paid' | 'delivered', value: boolean) => void;
  updateStudentResearch: (studentId: string, researchId: string, data: Partial<StudentResearch>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addResearch: (research: Omit<Research, 'id'>) => void;
  updateResearch: (id: string, data: Partial<Research>) => void;
  deleteResearch: (id: string) => void;
  addMessage: (studentId: string, studentName: string, content: string) => void;
  markMessageRead: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addLog: (type: LogType, description: string, details?: Record<string, any>) => void;
  getLogs: (type?: LogType) => AppLog[];
  clearLogs: () => void;
  getStudentById: (id: string) => Student | undefined;
  getTotalRevenue: () => number;
  getStats: () => {
    totalStudents: number;
    paidStudents: number;
    deliveredStudents: number;
    totalRevenue: number;
    collectionRate: number;
    productStats: { productId: string; name: string; sold: number; delivered: number; revenue: number }[];
  };
}

const ADMIN_PASSWORD = '107110';

const defaultProducts: Product[] = [
  { id: '1', name: 'أدوات', price: 120, stock: 100 },
  { id: '2', name: 'عضوية', price: 160, stock: 100 },
  { id: '3', name: 'حياكة', price: 100, stock: 100 },
  { id: '4', name: 'أسس', price: 120, stock: 100 },
  { id: '5', name: 'شيتات', price: 40, stock: 100 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isAdmin: false,
    students: [],
    products: defaultProducts,
    researches: [],
    messages: [],
    logs: [],
    settings: {},
    currentStudentId: null,
  });

  // Subscribe to Firebase logs on mount
  useEffect(() => {
    const unsubscribe = subscribeToLogs((logsData) => {
      if (logsData && Object.keys(logsData).length > 0) {
        const logsArray = Object.values(logsData).sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 1000);
        setState(prev => ({ ...prev, logs: logsArray }));
      }
    });
    return () => unsubscribe?.();
  }, []);

  const addLog = useCallback((type: LogType, description: string, details?: Record<string, any>) => {
    const newLog: AppLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      description,
      timestamp: new Date().toISOString(),
      details,
    };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 1000), // Keep last 1000 logs
    }));
    // Save to Firebase
    saveLogToFirebase(newLog).catch(() => {});
  }, []);

  const getLogs = useCallback((type?: LogType) => {
    if (type) {
      return state.logs.filter(log => log.type === type);
    }
    return state.logs;
  }, [state.logs]);

  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setState(prev => ({ ...prev, isAdmin: true }));
      addLog('admin_login', 'تسجيل دخول بكلمة مرور');
      return true;
    }
    return false;
  }, [addLog]);

  const googleLogin = useCallback((email: string) => {
    setState(prev => ({ ...prev, isAdmin: true, settings: { ...prev.settings, googleEmail: email } }));
    addLog('admin_login', `تسجيل دخول عبر Google: ${email}`);
  }, [addLog]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, isAdmin: false }));
    addLog('admin_logout', 'تسجيل الخروج');
  }, [addLog]);

  const setCurrentStudent = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentStudentId: id }));
  }, []);

  const addStudent = useCallback((studentData: Omit<Student, 'id' | 'orders' | 'researches' | 'notes' | 'createdAt'> & { academicYear: '25' | '26' }): Student => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      orders: state.products.map(p => ({ productId: p.id, selected: false, paid: false, delivered: false })),
      researches: state.researches.map(r => ({ researchId: r.id, submitted: false, status: 'pending' })),
      notes: [],
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    addLog('student_added', `إضافة طالب: ${studentData.name} - العام الجامعي: ${studentData.academicYear}`, { studentId: newStudent.id, name: studentData.name, academicYear: studentData.academicYear });
    return newStudent;
  }, [state.products, state.researches, addLog]);

  const updateStudent = useCallback((id: string, data: Partial<Student>) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, ...data } : s),
    }));
    addLog('student_updated', `تحديث بيانات طالب`, { studentId: id, changes: Object.keys(data) });
  }, [addLog]);

  const deleteStudent = useCallback((id: string) => {
    const student = state.students.find(s => s.id === id);
    setState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
    }));
    addLog('student_deleted', `حذف طالب: ${student?.name}`, { studentId: id });
  }, [state.students, addLog]);

  const bulkAddStudents = useCallback((names: string[], academicYear: '25' | '26' = '25') => {
    const newStudents: Student[] = names.map((name, index) => ({
      id: Date.now().toString() + index.toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      section: '',
      phone: '',
      academicYear,
      orders: state.products.map(p => ({ productId: p.id, selected: false, paid: false, delivered: false })),
      researches: state.researches.map(r => ({ researchId: r.id, submitted: false, status: 'pending' })),
      notes: [],
      createdAt: new Date().toISOString(),
    }));
    setState(prev => ({ ...prev, students: [...prev.students, ...newStudents] }));
    addLog('student_added', `إضافة ${names.length} طالب بالجملة - العام: ${academicYear}`, { count: names.length, academicYear });
  }, [state.products, state.researches, addLog]);

  const updateStudentOrder = useCallback((studentId: string, productId: string, field: 'selected' | 'paid' | 'delivered', value: boolean) => {
    setState(prev => {
      const student = prev.students.find(s => s.id === studentId);
      if (!student) return prev;

      const updatedStudents = prev.students.map(s => {
        if (s.id !== studentId) return s;
        const updatedOrders = s.orders.map(o => {
          if (o.productId !== productId) return o;
          return { ...o, [field]: value };
        });
        return { ...s, orders: updatedOrders };
      });

      let updatedProducts = prev.products;
      if (field === 'delivered') {
        updatedProducts = prev.products.map(p => {
          if (p.id !== productId) return p;
          const currentOrder = student.orders.find(o => o.productId === productId);
          if (value && currentOrder && !currentOrder.delivered) {
            return { ...p, stock: Math.max(0, p.stock - 1) };
          } else if (!value && currentOrder && currentOrder.delivered) {
            return { ...p, stock: p.stock + 1 };
          }
          return p;
        });
      }

      return { ...prev, students: updatedStudents, products: updatedProducts };
    });
    
    const logType = field === 'paid' ? 'payment' : field === 'delivered' ? 'delivery' : 'student_updated';
    const descriptions: Record<string, string> = {
      selected: 'تحديث اختيار المنتج',
      paid: `تسجيل دفع`,
      delivered: `تسجيل تسليم`,
    };
    addLog(logType, descriptions[field], { studentId, productId, field, value });
  }, [addLog]);

  const updateStudentResearch = useCallback((studentId: string, researchId: string, data: Partial<StudentResearch>) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => {
        if (s.id !== studentId) return s;
        const updatedResearches = s.researches.map(r => {
          if (r.researchId !== researchId) return r;
          return { ...r, ...data };
        });
        return { ...s, researches: updatedResearches };
      }),
    }));
    if (data.submitted) {
      addLog('research_submitted', `تسليم بحث`, { studentId, researchId });
    }
  }, [addLog]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      students: prev.students.map(s => ({
        ...s,
        orders: [...s.orders, { productId: newProduct.id, selected: false, paid: false, delivered: false }],
      })),
    }));
    addLog('product_added', `إضافة منتج: ${product.name}`, { productId: newProduct.id, name: product.name, price: product.price });
  }, [addLog]);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...data } : p),
    }));
    addLog('product_updated', `تحديث منتج`, { productId: id, changes: Object.keys(data) });
  }, [addLog]);

  const deleteProduct = useCallback((id: string) => {
    const product = state.products.find(p => p.id === id);
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
      students: prev.students.map(s => ({
        ...s,
        orders: s.orders.filter(o => o.productId !== id),
      })),
    }));
    addLog('product_deleted', `حذف منتج: ${product?.name}`, { productId: id });
  }, [state.products, addLog]);

  const addResearch = useCallback((research: Omit<Research, 'id'>) => {
    const newResearch: Research = {
      ...research,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setState(prev => ({
      ...prev,
      researches: [...prev.researches, newResearch],
      students: prev.students.map(s => ({
        ...s,
        researches: [...s.researches, { researchId: newResearch.id, submitted: false, status: 'pending' }],
      })),
    }));
    addLog('product_added', `إضافة بحث: ${research.name}`, { researchId: newResearch.id, name: research.name });
  }, [addLog]);

  const updateResearch = useCallback((id: string, data: Partial<Research>) => {
    setState(prev => ({
      ...prev,
      researches: prev.researches.map(r => r.id === id ? { ...r, ...data } : r),
    }));
    addLog('product_updated', `تحديث بحث`, { researchId: id });
  }, [addLog]);

  const deleteResearch = useCallback((id: string) => {
    const research = state.researches.find(r => r.id === id);
    setState(prev => ({
      ...prev,
      researches: prev.researches.filter(r => r.id !== id),
      students: prev.students.map(s => ({
        ...s,
        researches: s.researches.filter(r => r.researchId !== id),
      })),
    }));
    addLog('product_deleted', `حذف بحث: ${research?.name}`, { researchId: id });
  }, [state.researches, addLog]);

  const addMessage = useCallback((studentId: string, studentName: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      studentId,
      studentName,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
  }, []);

  const markMessageRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, read: true } : m),
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }));
    addLog('settings_changed', `تحديث الإعدادات`, { changes: Object.keys(settings) });
  }, [addLog]);

  const getStudentById = useCallback((id: string) => {
    return state.students.find(s => s.id === id);
  }, [state.students]);

  const getTotalRevenue = useCallback(() => {
    let total = 0;
    state.students.forEach(student => {
      student.orders.forEach(order => {
        if (order.paid) {
          const product = state.products.find(p => p.id === order.productId);
          if (product) {
            total += product.price;
          }
        }
      });
    });
    return total;
  }, [state.students, state.products]);

  const getStats = useCallback(() => {
    const totalStudents = state.students.length;
    let paidStudents = 0;
    let deliveredStudents = 0;
    let totalRevenue = 0;
    const productStats: { productId: string; name: string; sold: number; delivered: number; revenue: number }[] = 
      state.products.map(p => ({ productId: p.id, name: p.name, sold: 0, delivered: 0, revenue: 0 }));

    state.students.forEach(student => {
      let hasPaid = false;
      let hasDelivered = true;

      student.orders.forEach(order => {
        const product = state.products.find(p => p.id === order.productId);
        const stat = productStats.find(ps => ps.productId === order.productId);
        
        if (order.paid && product) {
          hasPaid = true;
          totalRevenue += product.price;
          if (stat) {
            stat.sold++;
            stat.revenue += product.price;
          }
        }
        
        if (order.delivered && stat) {
          stat.delivered++;
        }

        if (order.selected && !order.delivered) {
          hasDelivered = false;
        }
      });

      if (hasPaid) paidStudents++;
      if (hasDelivered && student.orders.some(o => o.selected)) deliveredStudents++;
    });

    const expectedRevenue = state.students.reduce((acc, student) => {
      return acc + student.orders.reduce((orderAcc, order) => {
        if (order.selected) {
          const product = state.products.find(p => p.id === order.productId);
          return orderAcc + (product?.price || 0);
        }
        return orderAcc;
      }, 0);
    }, 0);

    const collectionRate = expectedRevenue > 0 ? (totalRevenue / expectedRevenue) * 100 : 0;

    return { totalStudents, paidStudents, deliveredStudents, totalRevenue, collectionRate, productStats };
  }, [state.students, state.products]);

  const value: AppContextType = {
    ...state,
    login,
    googleLogin,
    logout,
    setCurrentStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkAddStudents,
    updateStudentOrder,
    updateStudentResearch,
    addProduct,
    updateProduct,
    deleteProduct,
    addResearch,
    updateResearch,
    deleteResearch,
    addMessage,
    markMessageRead,
    updateSettings,
    addLog,
    getLogs,
    clearLogs,
    getStudentById,
    getTotalRevenue,
    getStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
