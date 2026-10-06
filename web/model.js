// Interpret filename timestamps on a neutral UTC clock so browser locale/DST cannot alter intervals.
export const timestamp = snapshot => Date.parse(snapshot.time + 'Z');
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const group = Math.max(0, Math.floor(exponent / 3));
  const scale = 10 ** (group * 3);
  const decimals = Math.max(0, 3 - (exponent - group * 3));
  const factor = 10 ** decimals;
  const floored = Math.floor(value / scale * factor) / factor;
  const suffix = ['', 'k', 'm', 'b', 't', 'q', 'qi'][group] ?? `e${group * 3}`;
  return floored.toFixed(decimals) + suffix;
}
export function contributionOptions(ids) {
  const order = id => ({ '9': 7, '7': 8, '8': 9, gathered: 10 }[id] ?? Number(id));
  return [...new Set([...ids, 'gathered'])].sort((a,b) => order(a)-order(b));
}
export function guildTotals(snapshots, resource) {
  const ids = [...new Set(snapshots.flatMap(snapshot => Object.keys(snapshot.members)))];
  let lifetime = 0, daily = 0, dailyMembers = 0;
  for (const id of ids) {
    const totals = series(snapshots, id, resource, 'cumulative');
    lifetime += totals.findLast(value => value !== null) ?? 0;
    const rate = series(snapshots, id, resource, 'daily').at(-1);
    if (rate !== null && rate !== undefined) { daily += rate; dailyMembers++; }
  }
  return { lifetime, daily: dailyMembers ? daily : null, dailyMembers, members: ids.length };
}
export function series(snapshots, id, resource, mode) {
  if (resource === 'gathered') {
    const parts = ['7', '8', '9'].map(key => series(snapshots, id, key, mode));
    return snapshots.map((_, i) => parts.some(part => part[i] === null) ? null : parts.reduce((sum, part) => sum + part[i], 0));
  }
  return snapshots.map((snapshot, i) => {
    const member = snapshot.members[id];
    const current = member ? Number(member.contributions[resource] ?? 0) : null;
    if (mode === 'cumulative') return current;
    const previous = snapshots[i - 1];
    if (!member || !previous?.members[id]) return null;
    const before = Number(previous.members[id].contributions[resource] ?? 0);
    const days = (timestamp(snapshot) - timestamp(previous)) / 86400000;
    return days > 0 && current >= before ? (current - before) / days : null;
  });
}
