// Interpret filename timestamps on a neutral UTC clock so browser locale/DST cannot alter intervals.
export const timestamp = snapshot => Date.parse(snapshot.time + 'Z');
export function series(snapshots, id, resource, mode) {
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
