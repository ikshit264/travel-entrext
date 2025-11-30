import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, formatStr: string = "MMM dd, yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function calculateDaysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = typeof end === "string" ? parseISO(end) : end;
  return differenceInDays(endDate, startDate) + 1;
}

export function calculateBudgetPerDay(totalBudget: number, days: number): number {
  return totalBudget / days;
}

export function groupExpensesByCategory(expenses: Array<{ category: string; amount: number }>) {
  return expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateTotalExpenses(expenses: Array<{ amount: number }>): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}
