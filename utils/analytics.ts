import { Order, DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics, YearlyAnalytics } from '@/types';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, isSameDay, isSameWeek, isSameMonth, isSameYear, format } from 'date-fns';

export function calculateDailyAnalytics(orders: Order[], date: Date): DailyAnalytics {
  const dayOrders = orders.filter(order => 
    isSameDay(new Date(order.date), date) && order.status !== 'cancelled'
  );
  
  const totalRevenue = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalCost = dayOrders.reduce((sum, order) => sum + order.cost, 0);
  const lunchCount = dayOrders.filter(o => o.mealType === 'lunch' || o.mealType === 'both').length;
  const dinnerCount = dayOrders.filter(o => o.mealType === 'dinner' || o.mealType === 'both').length;
  
  return {
    date,
    totalOrders: dayOrders.length,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    lunchCount,
    dinnerCount,
  };
}

export function calculateWeeklyAnalytics(orders: Order[], date: Date): WeeklyAnalytics {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  
  const weekOrders = orders.filter(order => 
    isSameWeek(new Date(order.date), date, { weekStartsOn: 1 }) && order.status !== 'cancelled'
  );
  
  const dailyBreakdown: DailyAnalytics[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + i);
    dailyBreakdown.push(calculateDailyAnalytics(orders, currentDay));
  }
  
  const totalRevenue = weekOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalCost = weekOrders.reduce((sum, order) => sum + order.cost, 0);
  const lunchCount = weekOrders.filter(o => o.mealType === 'lunch' || o.mealType === 'both').length;
  const dinnerCount = weekOrders.filter(o => o.mealType === 'dinner' || o.mealType === 'both').length;
  
  return {
    weekStart,
    weekEnd,
    totalOrders: weekOrders.length,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    lunchCount,
    dinnerCount,
    dailyBreakdown,
  };
}

export function calculateMonthlyAnalytics(orders: Order[], date: Date): MonthlyAnalytics {
  const monthStart = startOfMonth(date);
  const monthOrders = orders.filter(order => 
    isSameMonth(new Date(order.date), date) && order.status !== 'cancelled'
  );
  
  const weeklyBreakdown: WeeklyAnalytics[] = [];
  let currentWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(date);
  
  while (currentWeek <= monthEnd) {
    weeklyBreakdown.push(calculateWeeklyAnalytics(orders, currentWeek));
    currentWeek = new Date(currentWeek);
    currentWeek.setDate(currentWeek.getDate() + 7);
  }
  
  const totalRevenue = monthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalCost = monthOrders.reduce((sum, order) => sum + order.cost, 0);
  const lunchCount = monthOrders.filter(o => o.mealType === 'lunch' || o.mealType === 'both').length;
  const dinnerCount = monthOrders.filter(o => o.mealType === 'dinner' || o.mealType === 'both').length;
  
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    totalOrders: monthOrders.length,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    lunchCount,
    dinnerCount,
    weeklyBreakdown,
  };
}

export function calculateYearlyAnalytics(orders: Order[], year: number): YearlyAnalytics {
  const yearOrders = orders.filter(order => 
    isSameYear(new Date(order.date), new Date(year, 0, 1)) && order.status !== 'cancelled'
  );
  
  const monthlyBreakdown: MonthlyAnalytics[] = [];
  for (let month = 0; month < 12; month++) {
    monthlyBreakdown.push(calculateMonthlyAnalytics(orders, new Date(year, month, 1)));
  }
  
  const totalRevenue = yearOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalCost = yearOrders.reduce((sum, order) => sum + order.cost, 0);
  const lunchCount = yearOrders.filter(o => o.mealType === 'lunch' || o.mealType === 'both').length;
  const dinnerCount = yearOrders.filter(o => o.mealType === 'dinner' || o.mealType === 'both').length;
  
  return {
    year,
    totalOrders: yearOrders.length,
    totalRevenue,
    totalCost,
    totalProfit: totalRevenue - totalCost,
    lunchCount,
    dinnerCount,
    monthlyBreakdown,
  };
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function getProfit(revenue: number, cost: number): number {
  return revenue - cost;
}

export function getProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

