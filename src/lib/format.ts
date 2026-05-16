export function formatMoney(amount: number, currency = "USD") {
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  if (amount > 0) return `+${formatted}`;
  return formatted;
}

export function formatPct(rate: number) {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatNumber(n: number, digits = 2) {
  return n.toFixed(digits);
}
