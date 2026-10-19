# On-Ground Call Centre App

A responsive front-end dashboard built for retail call centre agents, matching the On-Ground.ai design and workflow requirements.

---

## How to Run
1. Clone or download this repository.
2. Open `index.html` directly in Google Chrome (or using the VS Code Live Server extension).
3. No build tools or backend setup needed — everything runs client-side using local sample data.

---

## Tech Stack
- **HTML5 & CSS3**: Custom layout, design tokens, and media queries for desktop and mobile screens (`@media (max-width: 700px)`). Google Fonts: *DM Sans* and *Manrope*.
- **Vanilla JavaScript (ES6+)**: SPA view routing, dynamic DOM rendering, and event handling without external libraries.
- **Web Audio API**: Synthesizes authentic DTMF telephone keypad tones and ring cadence audio.
- **Web Speech API (`speechSynthesis`)**: Powers the in-browser voice for the AI customer and pitch coach practice session.

---

## Calling Feature & AI Coach
Since the assignment specifies sample data and no backend, I implemented a realistic in-browser calling experience using native browser APIs:

1. **In-Browser Calling & Callback**:
   - Clicking **"☎ Call"** or **"☎ Call back"** opens the calling console.
   - Includes ringing state with audio cadence, followed by an active connected timer (`MM:SS`).
   - Interactive controls: Microphone Mute/Unmute, interactive DTMF dialpad with audio feedback, in-call note taking, and an End Call button.
   - Hanging up logs the call duration, timestamp, and notes to the **Recent Calls** list and increments the daily completed call target.
   - An optional fallback link allows opening the device's default phone app via `tel:` if preferred.

2. **AI Pitch Coach Roleplay (AvaniBot)**:
   - Inside the call console, switching to the **"✳ AI Roleplay & Pitch Coach"** tab initiates a simulated roleplay.
   - The AI customer speaks questions aloud through the browser speech engine.
   - Displays real-time hints and recommended responses based on retail sales walk-out recovery strategies.

---

## Features Implemented
- **Dashboard**: KPI metrics, 7-day performance bar chart, target progress bars, priority leads preview, and a task checklist.
- **Task List to Lead Modal**: Clicking any task in "Your tasks" opens that customer's Lead Details modal.
- **Calls to Make**: Lead list sorted by score, pagination (4 items/page), search input, filter tags (*All leads*, *High intent*, *Follow-up*), and expandable rows (`▼`) showing buying signals.
- **Incoming Calls**: Missed calls tracking with quick 1-click callback.
- **Recent Calls**: Call history by type, time, and duration. Tapping any row opens a review dialog with simulated audio playback and transcript notes.
- **Calendar**: October 2026 month grid with month switcher, `Today` reset button, and schedule agenda.
- **Pulse & Channel Chat**: Team workspace with AI agents list, kudos, and an interactive `#needs-your-input` channel with 15-minute SLA voting.
- **Lead Details Modal**: ICP score, intent score, estimated value, buying signals, inline note-taking, and previous/next lead navigation (keyboard arrow keys supported).
- **Agent Playbook**: "Need a hand? Open playbook ↗" opens the daily retail walk-out recovery SOP.

---

## AI Tools Used
In accordance with the guidelines, I used Claude / ChatGPT for code review, edge-case checking, and refining the Web Audio/Speech implementations.

---

## File Structure
```
├── index.html        # App structure, header, sidebar & modals
├── styles.css        # Responsive styling & design system
├── app.js            # Router, sample data, calling engine & event handlers
└── README.md         # Documentation
```
