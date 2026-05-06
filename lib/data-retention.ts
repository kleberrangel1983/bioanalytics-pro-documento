export type RetentionItem = {
  id: string
  clinicId: string
  createdAtIso: string
}

export function filterExpiredItems(
  items: RetentionItem[],
  nowIso: string,
  retentionDays: number,
): RetentionItem[] {
  const nowTs = new Date(nowIso).getTime()
  const minTs = nowTs - retentionDays * 24 * 60 * 60 * 1000

  return items.filter((item) => new Date(item.createdAtIso).getTime() < minTs)
}

export function isRetentionPolicySafe(retentionDays: number): boolean {
  return retentionDays >= 7
}
