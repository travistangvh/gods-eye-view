# Singapore Haze 2026 scene

A built-in scene (`singapore-haze-2026` in `src/scenes/recipes.js`) with 14
shots, one per key moment of the August to October 2026 transboundary haze.
`videos.geojson` places three clickable points (Marina Bay, Palangkaraya, the
city skyline). Selecting one opens a card that links to the original news
video; the videos are not embedded or copied.

Each shot switches on the existing live layers that fit the moment: Active
Fires (`local-firms`, needs `FIRMS_MAP_KEY`), Wind, Recent Imagery, vessels and
flights. Fires show only the trailing 24 hours of the live feed, so the map
shows today's fires beside each past date; the shot titles carry the history.

PSI values appear in titles only. No PSI layer exists yet.

## Sources for the shot titles (checked 2026-10-24)

- NEA haze situation update, 5 Sep 2026: PSI 78-104, smoke from southern and
  central Sumatra and parts of Kalimantan, southeast or south winds.
  https://www.nea.gov.sg/media/news/advisories/index/haze-situation-update-05-september-2026
- Malay Mail, 9 Oct 2026: central region 2026 high of 181; 167 on 29 Sep.
  https://www.malaymail.com/amp/news/singapore/2026/10/09/singapore-central-region-hits-2026-record-of-181-psi-amid-transboundary-haze/238371
  (reported via search results; the page returned 403 to a direct fetch)
- Asian News Network, 20 Oct 2026: Minister Grace Fu's 16 Oct warning of PSI
  above 300, "worst bout of transboundary haze in more than a decade", legal
  notices to seven companies. https://asianews.network/?p=309080
- Euronews, 15 Oct 2026: aerial footage of Palangkaraya under haze.
  https://www.euronews.com/2026/10/15/indonesias-skies-turn-apocalyptic-orange-as-smoke-blankets-singapore
- Indonesian ministry data via databoks: 5,910 hotspots on 8 Sep 2026 (most in
  South Sumatra) and 12,357 in 24 hours on 17 Sep (3,028 in South Sumatra).
  Hotspots are satellite detections, not a count of fires.
- The Star, 29 Sep 2026: firefighting focused on South Sumatra and Central
  Kalimantan. https://www.thestar.com.my/aseanplus/aseanplus-news/2026/09/29/indonesia-focuses-firefighting-on-south-sumatra-central-kalimantan
- CGTN, 18 Oct 2026: live views of the smog-shrouded skyline.
  https://news.cgtn.com/news/2026-10-18/Live-Views-of-Singapore-s-smog-shrouded-skyline-1RkRm0xxao0/share_amp.html
- Bernama, Grand Prix (9-11 Oct) held under haze.
  https://bernama.com/en/world/news.php?id=2617934

Not verified: the mid-September Sumatra/Vietnam smoke extent (ASMC report seen
via search results only) and the exact date of the notices to seven firms.

## Limits

Camera positions are approximate and not yet checked against the rendered
globe. Shots are not a smoke model; fires and wind are shown together, which
does not prove which fire produced which smoke.
