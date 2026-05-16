import { notFound } from "next/navigation";

import { DailyReviewDayView } from "@/components/trades/daily-review-day-view";

export default async function DailyReviewDayPage(props: { params: Promise<{ date: string }> }) {
  const { date } = await props.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  return <DailyReviewDayView date={date} />;
}
