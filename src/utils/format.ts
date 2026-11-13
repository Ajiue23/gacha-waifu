export const formatNumber = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("id-ID").format(safe);
};
