# Feryal Slack Bot

A Google Apps Script Slack bot that connects to Slack's API and acts as an automated interface between a Slack workspace and Google Workspace data. Responds to user commands, sends reminders, and posts regular updates from live Google Forms and Sheets.

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Slack%20Bot-purple)
![Slack](https://img.shields.io/badge/Slack-API-4A154B?logo=slack&logoColor=white)

---

## Features

- Installable Slack bot that receives slash commands and events via webhook
- Connects to Google Drive, Google Sheets, and Google Forms via GAS server-side calls
- Responds to user requests with data pulled from Google Workspace
- Sends scheduled reminders to Slack channels about events and incidents
- Posts regular updates sourced from live form responses
- GIPHY integration for image responses
- Feature-module architecture — each functional area is an isolated module

---

## Tech Stack

| Layer        | Technology                               |
|--------------|------------------------------------------|
| Platform     | Google Apps Script (WebApp webhook)      |
| Messaging    | Slack API (via `UrlFetchApp`)            |
| Integrations | Google Sheets, Google Drive, Google Forms |
| Media        | GIPHY API                                |
| Deploy       | clasp CLI                                |

---

## Project Structure

```
feryal-slack-bot/
├── README.md
├── AGENT.md
├── .gitignore
├── package.json         # Dev-only (clasp tooling) — not used at runtime
├── screenshots/
└── src/
    ├── appsscript.json       # GAS manifest
    ├── Bot_f0-Main.js        # Entry point: doPost() dispatcher
    ├── Bot_f1-Moderation.js  # Moderation commands
    ├── Bot_f2-Groundteam.js  # Ground team commands
    ├── Bot_f3-Community.js   # Community commands
    ├── Bot_f4-Posting.js     # Posting commands
    ├── GIPHY Library.js      # GIPHY API integration
    └── Toolkit.js            # Shared utility functions
```

**Naming convention:** `Bot_f#-` prefix = feature module number. `Bot_f0-Main.js` receives all incoming Slack events and dispatches to the appropriate feature module.

---

## Getting Started

### Prerequisites

- A Google account with Google Apps Script access
- A Slack workspace with permission to install apps
- [clasp](https://github.com/google/clasp) installed globally

```bash
npm install -g @google/clasp
clasp login
```

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mohamedallam13/feryal-slack-bot.git
   cd feryal-slack-bot
   ```

2. Link to your Apps Script project:
   ```bash
   clasp create --type webapp --title "Feryal Slack Bot" --rootDir src
   ```

3. Push source files:
   ```bash
   clasp push
   ```

4. Store your Slack tokens in **Script Properties** (not in code):
   - In the Apps Script editor, go to **Project Settings > Script Properties**
   - Add: `SLACK_TOKEN`, `SLACK_SIGNING_SECRET`, `GIPHY_API_KEY`

---

## Deployment

1. In the Apps Script editor, go to **Deploy > New deployment**
2. Select type: **Web app**
3. Set **Execute as**: Me · **Who has access**: Anyone
4. Click **Deploy** — copy the Web App URL
5. In your Slack App settings, set the Web App URL as the **Request URL** for slash commands and events

---

## Author

**Mohamed Allam** — [GitHub](https://github.com/mohamedallam13) · [Email](mailto:mohamedallam.tu@gmail.com)
