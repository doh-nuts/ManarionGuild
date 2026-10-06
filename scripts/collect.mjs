import { mkdir, writeFile } from 'node:fs/promises';
const key = process.env.MANARION_API_KEY;
if (!key) { console.error('Set MANARION_API_KEY before collecting guild data.'); process.exit(1); }
try {
  const url = new URL('https://api.manarion.com/guilds/11');
  url.searchParams.set('apikey', key);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
  const guild = await response.json();
  if (guild.ID !== 11 || !guild.Members || typeof guild.Members !== 'object' || Array.isArray(guild.Members)) throw new Error('API response is not guild 11 data');
  // New filenames use UTC. Existing historical files have no timezone information.
  const now = new Date().toISOString().replace(/[-:]/g, '');
  const file = `data/guildData_${now.slice(0, 8)}_${now.slice(9, 15)}.json`;
  await mkdir('data', { recursive: true });
  await writeFile(file, JSON.stringify(guild), { flag: 'wx' });
  console.log(`Saved ${file}`);
} catch (error) {
  console.error(error.name === 'TimeoutError' ? 'Guild API request timed out.' : error.message.startsWith('API ') ? error.message : 'Could not collect guild data. Check connectivity and API credentials.');
  process.exitCode = 1;
}
