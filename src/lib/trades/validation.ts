import type { TradeDraft } from "@/lib/trades/types";

export interface TradeValidationResult {
  ok: boolean;
  errors: string[];
  draft?: TradeDraft;
}

function parseNum(raw: string): number {
  return Number(String(raw).replace(/,/g, "").trim());
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Build and validate a trade draft from form fields. */
export function validateTradeForm(fd: FormData): TradeValidationResult {
  const errors: string[] = [];

  const date = String(fd.get("date") ?? "").trim();
  const symbol = String(fd.get("symbol") ?? "").trim();
  const direction = String(fd.get("direction") ?? "long");

  if (!date) errors.push("Date is required.");
  if (!symbol) errors.push("Symbol is required.");
  if (direction !== "long" && direction !== "short") errors.push("Direction must be long or short.");

  const entry_price = parseNum(String(fd.get("entry_price") ?? ""));
  const exit_price = parseNum(String(fd.get("exit_price") ?? ""));
  const stop_loss = parseNum(String(fd.get("stop_loss") ?? ""));
  const risk_amount = parseNum(String(fd.get("risk_amount") ?? ""));
  const pnl = parseNum(String(fd.get("pnl") ?? ""));

  for (const [label, n] of [
    ["Entry", entry_price],
    ["Exit", exit_price],
    ["Stop loss", stop_loss],
    ["Risk", risk_amount],
    ["P/L", pnl],
  ] as const) {
    if (Number.isNaN(n)) errors.push(`${label} must be a number.`);
  }

  const confidenceRaw = String(fd.get("confidence_score") ?? "").trim();
  const disciplineRaw = String(fd.get("discipline_score") ?? "").trim();

  const confidence_score = confidenceRaw ? Number(confidenceRaw) : null;
  const discipline_score = disciplineRaw ? Number(disciplineRaw) : null;

  if (confidence_score != null && (Number.isNaN(confidence_score) || confidence_score < 1 || confidence_score > 10)) {
    errors.push("Confidence must be between 1 and 10.");
  }
  if (discipline_score != null && (Number.isNaN(discipline_score) || discipline_score < 1 || discipline_score > 10)) {
    errors.push("Discipline must be between 1 and 10.");
  }

  if (errors.length) return { ok: false, errors };

  const draft: TradeDraft = {
    date,
    symbol,
    direction: direction as TradeDraft["direction"],
    entry_price,
    exit_price,
    stop_loss,
    risk_amount,
    pnl,
    setup: String(fd.get("setup") ?? "").trim() || null,
    session: String(fd.get("session") ?? "").trim() || null,
    emotion: String(fd.get("emotion") ?? "").trim() || null,
    notes: String(fd.get("notes") ?? "").trim() || null,
    what_went_right: String(fd.get("what_went_right") ?? "").trim() || null,
    what_went_wrong: String(fd.get("what_went_wrong") ?? "").trim() || null,
    lesson_learned: String(fd.get("lesson_learned") ?? "").trim() || null,
    tags: parseTags(String(fd.get("tags") ?? "")),
    mistake_tags: parseTags(String(fd.get("mistake_tags") ?? "")),
    confidence_score,
    discipline_score,
  };

  return { ok: true, errors: [], draft };
}

/** Serialize draft for localStorage autosave (no File objects). */
export function draftToAutosave(draft: Partial<TradeDraft>): string {
  return JSON.stringify(draft);
}

export function draftFromAutosave(raw: string | null): Partial<TradeDraft> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<TradeDraft>;
  } catch {
    return null;
  }
}
