# Singapore haze demo: storyboard and build plan

Working notes for the `hazy-god-eye-view` fork. Not upstream documentation.

**Story:** Singapore's air is decided 500 km away. The city looks normal from
above; the cause is on another island, and the globe is the one place to see
both at once. Target length about 90 seconds.

Facts used in the story come from news coverage of the October 2026 episode
(central-region 24-hour PSI of 181 on 9 Oct, a ministerial warning on 16 Oct
that readings could pass 300, a strong El Nino, rainfall about 80% below
normal since June). **Verify every figure against NEA before it goes on
screen.** Do not name a company or a specific fire as the source of specific
smoke; label anything modelled as an estimate.

## Storyboard

| # | Beat | Viewer sees | Camera | Data | Status |
|---|---|---|---|---|---|
| 1 | Normal (0-10s) | Singapore in photoreal 3D, flights into Changi, ships in the Strait | Slow orbit over Marina Bay | Google 3D tiles, flights, AIS | Exists |
| 2 | The reading (10-20s) | PSI labels on the five regions, tinted amber to red; caption "Oct 9: central PSI 181" | Hold, then tilt up | NEA PSI | Build |
| 3 | Pull back (20-30s) | Globe widens past Malacca to Sumatra and Kalimantan | Fast pull-out | none | Exists |
| 4 | The fires (30-45s) | Fire points light up across Sumatra and Kalimantan | Hover over southern Sumatra | NASA FIRMS | Exists, needs `FIRMS_MAP_KEY` |
| 5 | The wind (45-55s) | Particles stream from the fires toward Singapore | Follow the flow | GFS / ECMWF wind | Exists |
| 6 | The smoke (55-65s) | Satellite smoke or aerosol layer fades in | Same wide shot | NASA GIBS | Check which layers exist |
| 7 | Why now (65-75s) | Text cards: El Nino, dry season, drained peat | Static or slow drift | news | Text only |
| 8 | Back to the street (75-85s) | Traffic cameras, taxis thinning | Dive to expressway cameras | LTA/data.gov.sg cameras, taxis | Build |
| 9 | Close (85-90s) | Region view, live PSI, "Fires don't stop at borders." | Slow pull-out | live PSI | Build |

Minimum viable cut: beats 3-5 need almost nothing new. Add beat 2 next for the
Singapore anchor, then 8-9.

## Build plan

Order matters: each step produces something you can see before the next starts.

1. **Run the original.** `npm install`, start the dev server, confirm the globe
   loads keyless. Read `README.md` and `docs/CODE-BOUNDARIES.md`.
2. **Add `FIRMS_MAP_KEY`** (free, NASA FIRMS) via the in-app POWER UP panel or
   `.env`. Confirm `/api/firms` returns fires over Sumatra. Study
   `server/providers/firms.js`: it only serves the trailing 24 hours.
3. **Add Singapore as a preset city** in `src/cityPois.js` (name, bounds,
   ground elevation, five POIs with range/heading/pitch). See
   `src/cityPresets.test.mjs` for what the data is checked against.
4. **Rehearse beats 3-5** with the existing layers: flights/ships, FIRMS, wind.
   Check whether GIBS offers an aerosol or smoke layer (beat 6).
5. **Start the PSI logger first.** A small script, outside the app at first,
   that polls NEA PSI and PM2.5 from data.gov.sg every hour into timestamped
   files. History cannot be recovered later. Verify the current endpoint path
   and response shape before coding against it.
6. **Add a PSI provider** under `server/providers/` following the pattern of
   the existing proxies (memory plus disk cache, serve-stale on failure,
   keyless-safe), then a region-tint layer in the UI.
7. **Add the Singapore CCTV pack.** Study how the Hong Kong pack is registered
   in `server/providers/cctv/sources.js` (catalog parser, image origin, max
   sources, env flags documented in `.env.example`). Singapore's feed is stills
   roughly every 20 seconds, not video, and the repo never archives frames.
8. **Add taxi availability** (data.gov.sg) as a point or heat layer, and
   LTA speed bands if you want road colouring. LTA DataMall needs a free key.
9. **Optional frame logger** for cameras, same idea as step 5. Check
   data.gov.sg terms before republishing any saved frames.
10. **Script the tour** with the Director system (`docs/DIRECTOR.md`,
    `docs/DIRECTOR-CAMERA.md`, `docs/DIRECTOR-DATA-PACKS.md`): one shot per
    beat. Alternatively screen-record the live app.
11. **Attribution and licences.** Add credits for each new source in
    `DATA_SOURCES.md` and the in-app Data attribution list
    (`src/data/dataCredits.js`). Note the non-commercial limits already in the
    repo (OpenSky, TeleGeography) if the demo goes public.
12. **Tests and changelog.** The repo uses `*.test.mjs` next to modules and a
    `changelog.d/` fragment per change.

## Open questions

- Narration vs. silent with captions.
- Live demo vs. recorded cut; haze season is roughly June to October.
- Whether the data.gov.sg `date_time` parameter still returns historical
  camera images (would allow an Oct 9 replay without a logger).
- Where open data exists for flood sensors, lightning, electricity demand.
