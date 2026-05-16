import { notFound } from "next/navigation";

import { MonthlyReviewMonthView } from "@/components/trades/monthly-review-view";

export default async function MonthlyReviewMonthPage(props: { params: Promise<{ month: string }> }) {
  const { month } = await props.params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();
  return <MonthlyReviewMonthView month={month} />;
}
