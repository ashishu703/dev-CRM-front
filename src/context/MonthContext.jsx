import React, { createContext, useContext, useState, useEffect } from 'react';

// Month utilities - shared with backend
const MonthUtils = {
  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  getMonthStart(monthString) {
    const [year, month] = monthString.split('-');
    return `${year}-${month}-01`;
  },

  getMonthEnd(monthString) {
    const [year, month] = monthString.split('-');
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  },

  getMonthRange(monthString) {
    return {
      start: this.getMonthStart(monthString),
      end: this.getMonthEnd(monthString)
    };
  },

  isValidMonth(monthString) {
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regex.test(monthString)) return false;
    
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  },

  getPreviousMonth(monthString) {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  },

  getNextMonth(monthString) {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  },

  isMonthClosed(monthString) {
    const currentMonth = this.getCurrentMonth();
    return monthString < currentMonth;
  },

  formatMonthDisplay(monthString) {
    if (!this.isValidMonth(monthString)) return 'Invalid Month';
    
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  },

  getLastTwelveMonths() {
    const months = [];
    const currentMonth = this.getCurrentMonth();
    
    for (let i = 0; i < 12; i++) {
      const month = this.getPreviousMonth(
        i === 0 ? currentMonth : months[0].value
      );
      months.unshift({
        value: month,
        label: this.formatMonthDisplay(month)
      });
    }
    
    return months;
  }
};

const MonthContext = createContext();

export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => MonthUtils.getCurrentMonth());
  const [monthRange, setMonthRange] = useState(() => MonthUtils.getMonthRange(selectedMonth));

  useEffect(() => {
    setMonthRange(MonthUtils.getMonthRange(selectedMonth));
  }, [selectedMonth]);

  const value = {
    selectedMonth,
    setSelectedMonth,
    monthRange,
    isCurrentMonth: selectedMonth === MonthUtils.getCurrentMonth(),
    isMonthClosed: MonthUtils.isMonthClosed(selectedMonth),
    monthDisplay: MonthUtils.formatMonthDisplay(selectedMonth),
    monthUtils: MonthUtils,
    availableMonths: MonthUtils.getLastTwelveMonths()
  };

  return (
    <MonthContext.Provider value={value}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => {
  const context = useContext(MonthContext);
  if (!context) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
};

export default MonthContext;
