# On-Ground.ai Call Centre App — Engineering Submission

A responsive, high-performance front-end application built for offline retail call centre agents. Designed to match the On-Ground.ai design language and workflow requirements.

---

## 🚀 How to Run Locally
1. Clone or extract this repository.
2. Double-click `index.html` to open directly in Google Chrome (or use the VS Code Live Server extension).
3. **No `npm install` or backend server required** — runs entirely in the browser with local mock data as specified in the assignment rules.

---

## 🛠 Tech Stack & Architectural Rationale
- **Semantic HTML5**: Lightweight, accessible DOM structure with modal backdrops, dialogs, and ARIA roles.
- **Custom CSS3 (Variables & Flex/Grid)**: Handcrafted responsive design replicating the mock layout across laptop and mobile viewports (`@media (max-width: 700px)`). Google Fonts: *DM Sans* and *Manrope*.
- **Vanilla JavaScript (ES6+)**:
  - Zero-dependency Single Page Application (SPA) state-driven view router.
  - Native **Web Audio API** for synthesized DTMF dual-tone keypad feedback during phone calls.
  - Native **Web Speech API** (`window.speechSynthesis`) for real in-browser AI-to-human spoken customer dialogue and pitch coaching.
  - In-memory data store for leads, active calls, and real-time interaction states.

---

## 📞 How the Calling Feature Works
The assignment required a working calling feature demonstrating both human-to-human and AI-to-human interactions without a backend server:

1. **In-Browser Customer Call & Callback**:
   - Clicking **"☎ Call"** or **"☎ Call back"** opens the in-browser Calling Console.
   - Simulates realistic telephony signaling: **Ringing state** with audible ring cadence tone, followed by **Connected state** with a live `MM:SS` duration timer.
   - Interactive call controls:
     - **Microphone Mute / Unmute** toggle with visual status badge.
     - **DTMF Keypad** that generates authentic dual-frequency tones via the browser's Web Audio API (`AudioContext`).
     - **In-Call Notes** textarea for logging customer agreements, delivery dates, and quotes.
     - **End Call Button**: Hangs up, stops audio timers, records the call into the Recent Call history with duration and timestamp, and increments the agent's completed calls count.
   - **External Device Fallback**: An optional link allows handoff to `tel:` if an agent prefers an external OS phone dialer.

2. **AI-to-Human Pitch Coach & Roleplay (AvaniBot)**:
   - Switch to the **"✳ AI Roleplay & Pitch Coach"** tab inside the call screen.
   - **AvaniBot** speaks simulated customer objections and questions aloud through laptop speakers using `speechSynthesis`.
   - Displays real-time conversational transcripts and hints based on On-Ground's retail conversion insights (+23.6pp lift when naming the customer and unblocking warranty/EMI objections).
   - Agent can select recommended pitch responses, which are vocalized and responded to dynamically by the AI customer.

---

## 📋 PDF Requirements Checklist & Verification

| PDF Requirement | Status | Implementation Details |
| :--- | :---: | :--- |
| **App Shell** | ✅ Complete | Fixed sidebar, sticky topbar with shift badge, dynamic breadcrumbs, and responsive mobile drawer menu. |
| **Dashboard** | ✅ Complete | KPI cards, 7-day CSS bar chart, daily target progress bars, priority leads preview, and clickable daily task checklist. |
| **Task List to Leads Modal** | ✅ Complete | Clicking any task in "Your tasks" (e.g. *Follow up with Priya Nair*) immediately opens that customer's Lead Modal. |
| **Calls to Make** | ✅ Complete | Leads ranked by score, pagination (4 per page), live search filtering, filter tags (*All leads*, *High intent*, *Follow-up*), and **expandable rows** (`▼`) showing buying signals and contact details. |
| **Incoming Calls** | ✅ Complete | Tracks missed calls with value at stake and instant 1-click callback buttons. |
| **Recent Calls** | ✅ Complete | Logged calls by type, time, and duration. **Tap any row to review**: opens the Call Review modal with playback audio waveform and AI summary notes. |
| **Calendar** | ✅ Complete | Full 42-day month grid for October 2026, month switcher (`←`, `→`), `Today` button, event indicators, and daily schedule agenda. |
| **Pulse & Channels** | ✅ Complete | Displays AI agents (AvaniBot, Role Agent, Task Agent), channels, and kudos list. |
| **Pulse Channel Chat** | ✅ Complete | Interactive `#needs-your-input` channel. Agent can vote on the pinned 15-minute SLA card (recording the decision and auto-posting to chat) and send new messages. |
| **Leads Modal with Paging** | ✅ Complete | Displays ICP score, intent score, estimated value, buying signals, inline note-taking, and Next (`→`) / Previous (`←`) cycling (also supports keyboard arrows and Escape). |
| **Need a Help / Playbook** | ✅ Complete | Sidebar *"Need a hand? Open playbook ↗"* opens the On-Ground Daily SOP Guide with walk-out recovery scripts and objection handling. |

---

## 🤖 AI Tools Disclosure
In compliance with the assignment rules, this implementation was refined using **Google DeepMind Antigravity / Claude** as a pair programming assistant to audit edge cases, write unit-tested UI routines, and implement native browser speech and audio synthesis.

---

## 📁 Repository Structure
├── index.html        # Semantic HTML5 app shell & dialog markup
├── styles.css        # Responsive styling & design tokens
├── app.js            # Core application logic, calling engine & router
└── README.md         # Documentation & walkthrough

