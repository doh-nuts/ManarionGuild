# Manarion Guild contribution dashboard

A dependency-free static website built from the timestamped JSON records in `data/`. Resource labels come from the Loot IDs in `Manarion API Docs.htm`.

## Run locally

Requires Node.js 20 or newer. No dependency installation is needed.

```sh
npm run dev
```

Open http://localhost:4173. Select members, a resource, and date range. Hover or focus a chart point for its value. The table provides readable values for selected members. `npm run build` creates `dist/` for any static host. Rebuild/redeploy after collecting new records. `npm test` verifies contribution calculations.

## Collect a new record

In PowerShell, set the guild API key in your session and run:

```powershell
$env:MANARION_API_KEY = 'your-guild-api-key'
npm run collect
```

The script requests guild 11, validates the response, and saves a new timestamped JSON file. It never puts the API key into the website or logs the request URL.

## Daily GitHub Actions collection

Push this project to a GitHub repository, then add an Actions repository secret named `MANARION_API_KEY` with your guild API key. The included `.github/workflows/daily-guild-data.yml` runs at 04:15 UTC each day (9:15 PM Pacific daylight time / 8:15 PM Pacific standard time on the previous calendar day) and supports manual runs. It validates the website and commits new records to the default branch. Allow Actions to write repository contents; branch protections must permit the bot's push. The workflow collects records; it does not deploy the website. Scheduled runs may be delayed by GitHub.

## Data interpretation

- Cumulative mode shows lifetime API totals, including contributions made before the first record. Filtering dates does not reset the baseline.
- Per-day mode divides the difference between consecutive snapshots by elapsed days, including fractional days. With gaps this is an interval average, not reconstructed calendar-day activity. A range's first rate can use the preceding snapshot outside that range.
- Missing members are gaps, not zeroes. Members are matched by ID, with their latest recorded name. Former members remain selectable. Counter decreases and first observations have no daily rate.
- Historical filenames do not identify a timezone; they are interpreted on a neutral UTC clock to preserve written timestamps and avoid browser-dependent DST changes. New collector timestamps use UTC. If historical records used local time, the transition interval may be offset; exact historical offsets cannot be recovered from filenames alone.
- Values use JavaScript numbers, matching the existing JSON data. Very large totals may have floating-point rounding.

The existing source records and requirements are preserved.
