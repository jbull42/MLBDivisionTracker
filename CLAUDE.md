# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Chrome extension (Manifest V3) that shows MLB standings/scores in the browser toolbar popup. There is no build system, package manager, or test suite — it's plain HTML/CSS/JS loaded directly by Chrome.

## Running / testing changes

There are no build or test commands. To try changes:

1. Open `chrome://extensions`, enable Developer mode.
2. "Load unpacked" and select this directory (or "Reload" if already loaded).
3. Click the extension's toolbar icon to open `popup.html` and see the result.
4. Right-click the popup → Inspect to get a DevTools console for `popup.js` (needed since `console.log`/errors don't show in the main browser console).

## Architecture

- `manifest.json` — MV3 manifest; `action.default_popup` points to `popup.html`. No background service worker or content scripts are declared yet.
- `popup.html` / `popup.css` / `popup.js` — the entire popup UI. `popup.js` runs on popup open via `main()`.
- `mapping.json` — static lookup data mapping MLB team/division IDs (as used by the MLB Stats API) to human-readable names, e.g. `"110": { "name": "Baltimore Orioles", "division": "AL East" }`. Not yet loaded/fetched by `popup.js`.
- Data source: the public MLB Stats API, `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=YYYY-MM-DD`, called directly from `popup.js` via `fetch`. No API key required.

## Current state / in-progress wiring

- `popup.html` title/heading is hardcoded to "AL Central" while `displayStandings()` in `popup.js` renders a hardcoded AL Central team list — neither is wired to live data yet.
- `getGames()` fetches today's schedule from the MLB Stats API and currently just returns the raw response.
- `filterGames(ids)` and the connection between fetched game data, `mapping.json`, and `displayStandings()` are not yet implemented — `main()` currently only logs the fetched schedule data.
