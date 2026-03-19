# AGENT.md — feryal-slack-bot

## Purpose
A Google Apps Script Slack bot that integrates with Slack's API to send information and reminders sourced from Google Sheets, Docs, and Forms. Acts as an automated interface between Google Workspace and Slack.

## Structure
```
feryal-slack-bot/
├── README.md
├── AGENT.md
├── .gitignore
├── package.json         ← dev-only (clasp tooling), not used at runtime
├── screenshots/
└── src/
    ├── appsscript.json      ← GAS manifest
    ├── Bot_f0-Main.js       ← main entry / bot dispatcher
    ├── Bot_f1-Moderation.js ← moderation command handlers
    ├── Bot_f2-Groundteam.js ← ground team command handlers
    ├── Bot_f3-Community.js  ← community command handlers
    ├── Bot_f4-Posting.js    ← posting command handlers
    ├── GIPHY Library.js     ← GIPHY API integration helper
    └── Toolkit.js           ← shared utility functions
```

## Key Facts
- **Platform:** Google Apps Script (WebApp deployed as Slack webhook receiver)
- **Integrations:** Slack API (`UrlFetchApp`), Google Sheets, Google Docs, Google Forms, GIPHY
- **Pattern:** `Bot_f#-` prefix = feature module; `Bot_f0-Main.js` dispatches to feature modules
- **Entry point:** `Bot_f0-Main.js` → `doPost()` receives Slack slash commands / events
- **`package.json`** is dev-only (clasp CLI); not executed at runtime

## Development Notes
- All source files live under `src/` — push with clasp from that directory
- No Node/npm at runtime; ES5-compatible GAS code only
- Slack tokens and webhook URLs should be stored in Script Properties, not hardcoded
