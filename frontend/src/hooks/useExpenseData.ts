import { useState, useEffect, useMemo } from 'react';
import type { ExpenseRow } from '@components/dashboard/ExpenseTable';
import type { DashboardData } from '@/types/dashboard.types';

// Helper to capitalize first letter
const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper to format payment method
const formatPaymentMethod = (method: string): string => {
  if (!method) return method;
  if (method === 'netbanking') return 'Net Banking';
  if (method === 'upi') return 'UPI';
  return capitalize(method);
};

interface UseExpenseDataReturn {
  expenseRows: ExpenseRow[];
  setExpenseRows: React.Dispatch<React.SetStateAction<ExpenseRow[]>>;
  addExpenseRow: () => void;
  removeExpenseRow: (id: string) => void;
  updateExpenseRow: (id: string, field: keyof ExpenseRow, value: string) => void;
}

const emptyExpenseRow: ExpenseRow = {
  id: '1',
  category: '',
  amount: '',
  description: '',
  paymentMethod: '',
  merchant: '',
  notes: '',
};

export function useExpenseData(
  data: DashboardData | null,
  selectedDate: string
): UseExpenseDataReturn {
  // Calculate initial rows from data
  const initialRows = useMemo(() => {
    if (data?.expenses?.entries && data.expenses.entries.length > 0) {
      return data.expenses.entries.map(
        (e): ExpenseRow => ({
          id: e._id,
          category: capitalize(e.category),
          amount: e.amount.toString(),
          description: e.description,
          paymentMethod: e.paymentMethod ? formatPaymentMethod(e.paymentMethod) : '',
          merchant: e.merchant || '',
          notes: e.notes || '',
        })
      );
    }
    return [emptyExpenseRow];
  }, [data, selectedDate]);

  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>(initialRows);

  // Update rows when data changes
  useEffect(() => {
    setExpenseRows(initialRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.expenses?.entries, selectedDate]);

  const addExpenseRow = () => {
    setExpenseRows([
      ...expenseRows,
      {
        id: Date.now().toString(),
        category: '',
        amount: '',
        description: '',
        paymentMethod: '',
        merchant: '',
        notes: '',
      },
    ]);
  };

  const removeExpenseRow = (id: string) => {
    if (expenseRows.length > 1) {
      setExpenseRows(expenseRows.filter((row) => row.id !== id));
    }
  };

  const updateExpenseRow = (id: string, field: keyof ExpenseRow, value: string) => {
    setExpenseRows(expenseRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return {
    expenseRows,
    setExpenseRows,
    addExpenseRow,
    removeExpenseRow,
    updateExpenseRow,
  };
}
