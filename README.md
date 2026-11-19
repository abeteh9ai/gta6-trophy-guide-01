# Vice City Trophy Guide — GTA VI (PS5)

An offline web app: the best guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI. Static files that open in a desktop browser
and work with the network off.

- Every trophy with its official name, description and grade, a checklist
  saved in the browser, export and import, filters by kind and grade, and a
  spoiler setting that hides story trophies until they are earned.
- A roadmap to the platinum (about 200 hours, 4/10) and the missable
  trophies flagged, built from the official descriptions.
- A guide to each trophy in our own words that cites its sources: what to
  do, where and how, and when it can be missed. Five trophies still have
  no confirmed unlock method after launch day; their guides say so
  plainly. The Truth Is Out There was confirmed on launch day by a
  player video (UFO abduction event in Kelly County after 2am).

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or open `app/index.html` directly from the files. No build step, no network.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` first checks that `app/data/trophies.json` loads and holds all
55 trophies (failing loudly if it does not), then copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with the
kit's `vendor/makefun-frontend.ts`.

## Sources

Trophy names, descriptions and grades cross-checked across Output Lag
(outputlag.com/guides/gta-6-trophy-list/), GTAVibes
(gtavibes.com/guides/gta-6-trophy-list-achievements), GamesRadar+ / PC Gamer
(via gtasix.how/trophies/) and PowerPyx / GTABase (via
gta-zone.com/news/gta-6-trophies-achievements/) — all agreeing on all 55.

Unofficial fan guide. Grand Theft Auto VI is developed and published by
Rockstar Games. No Rockstar logo, artwork, box art or game screenshot is
used here.

## License

MIT — see LICENSE.
