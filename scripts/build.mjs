import { readdir, readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
const files = (await readdir('data')).filter(f => /^guildData_\d{8}_\d{6}(?:\.json)?$/.test(f)).sort();
const snapshots = [];
for (const file of files) {
  const [, y, mo, d, h, mi, s] = file.match(/^guildData_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  const guild = JSON.parse(await readFile(`data/${file}`, 'utf8'));
  if (!guild.Members || typeof guild.Members !== 'object') throw new Error(`Invalid members in ${file}`);
  snapshots.push({ time: `${y}-${mo}-${d}T${h}:${mi}:${s}`, name: guild.Name, level: guild.Level, dungeon: guild.DungeonLevel,
    members: Object.fromEntries(Object.entries(guild.Members).map(([id, m]) => [id, { name: m.Name, contributions: m.Contributions || {} }])) });
}
if (!snapshots.length) throw new Error('No guild snapshots found');
const docs = await readFile('Manarion API Docs.htm', 'utf8');
const section = docs.match(/<h3>Loot IDs<\/h3>\s*<pre>([\s\S]*?)<\/pre>/)?.[1];
if (!section) throw new Error('Loot IDs missing in API reference');
const resources = Object.fromEntries([...section.matchAll(/([A-Z_]+)\s*=\s*(\d+)/g)].map(([, name, id]) => [id, name.toLowerCase().split('_').map(w => w === 'xp' ? 'XP' : w[0].toUpperCase() + w.slice(1)).join(' ')]));
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'model.js', 'favicon.svg']) await copyFile(`web/${file}`, `dist/${file}`);
await writeFile('dist/data.json', JSON.stringify({ resources, snapshots }));
console.log(`Built website with ${snapshots.length} snapshots.`);
