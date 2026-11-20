/**
 * A small limit on how often the contact form may send email.
 *
 * The form sends a confirmation to whichever address is typed in, so without a
 * limit the website could be used to post ENERDI branded email to a stranger,
 * or to burn through the Gmail sending quota for the day.
 *
 * The tally is kept in this process only. If the site ever runs as more than
 * one instance, each keeps its own count, so treat this as a brake on casual
 * abuse rather than a guarantee.
 */

const WINDOW_MS = 15 * 60 * 1000;

/** Keeps the tally from growing without bound if the site is flooded. */
const MAX_KEYS = 5000;

export type Allowance = { key: string; limit: number };

const uses = new Map<string, number[]>();

function withinWindow(key: string, now: number) {
  const times = uses.get(key);
  return times ? times.filter((time) => now - time < WINDOW_MS) : [];
}

/** Forgets keys that have aged out, oldest first if that is not enough. */
function forgetOld(now: number) {
  for (const [key, times] of uses) {
    const live = times.filter((time) => now - time < WINDOW_MS);
    if (live.length === 0) uses.delete(key);
    else uses.set(key, live);
  }

  if (uses.size > MAX_KEYS) {
    const oldestFirst = [...uses.entries()].sort(
      (a, b) => Math.max(...a[1]) - Math.max(...b[1]),
    );
    for (const [key] of oldestFirst.slice(0, uses.size - MAX_KEYS)) {
      uses.delete(key);
    }
  }
}

/** True when any of these has already used up its allowance. */
export function overLimit(allowances: Allowance[], now = Date.now()) {
  return allowances.some(
    ({ key, limit }) => withinWindow(key, now).length >= limit,
  );
}

/** Counts one use against each allowance. */
export function recordUse(allowances: Allowance[], now = Date.now()) {
  if (uses.size > MAX_KEYS) forgetOld(now);
  for (const { key } of allowances) {
    uses.set(key, [...withinWindow(key, now), now]);
  }
}
