const ALERT_DISMISSED_UNTIL_KEY = "compromisos_alert_dismissed_until";
export const ALERT_TTL_MS = 6 * 60 * 60 * 1000;

const safeGetItem = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
};

export const getAlertDismissedUntil = () => {
  const raw = safeGetItem(ALERT_DISMISSED_UNTIL_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

export const setAlertDismissedUntil = (timestamp: number) => {
  safeSetItem(ALERT_DISMISSED_UNTIL_KEY, String(timestamp));
};

export const shouldShowAlert = (hasData: boolean) => {
  if (!hasData) return false;
  const dismissedUntil = getAlertDismissedUntil();
  if (!dismissedUntil) return true;
  return Date.now() > dismissedUntil;
};
