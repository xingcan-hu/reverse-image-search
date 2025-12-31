export const getCheckinDay = (now: Date = new Date()) => {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const getNextResetAt = (now: Date = new Date()) => {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
};

export const formatDayKey = (day: Date) => day.toISOString().slice(0, 10);
