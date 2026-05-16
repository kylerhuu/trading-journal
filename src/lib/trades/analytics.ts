/**
 * Analytics helpers — single source of truth from Trade[].
 */
export {
  computeDashboard,
  computeDayStats,
  computeMonthlyReview,
  equityCurve,
  monthCalendarDays,
  monthlyPnLSeries,
  topMistakes,
  tradesByDay,
  weekdayPerformance,
} from "@/lib/analytics";

export type {
  DashboardSummary,
  DayAgg,
  DailyReviewDerived,
  EquityPoint,
  MistakeCount,
  MonthlyPnLPoint,
  MonthlyReviewMetrics,
  WeekdayPerf,
} from "@/lib/analytics";

import {
  computeDashboard,
  computeDayStats,
  computeMonthlyReview,
  tradesByDay,
} from "@/lib/analytics";

export const calculateDashboardStats = computeDashboard;
export const calculateCalendarStats = tradesByDay;
export const calculateMonthlyStats = computeMonthlyReview;
export const calculateDayStats = computeDayStats;
