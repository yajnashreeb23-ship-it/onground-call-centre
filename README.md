# On-Ground.ai Call Centre App — Starter

A responsive front-end prototype built with HTML, CSS and vanilla JavaScript, using local sample data. No backend is included.

## Run locally
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Open `index.html` in Chrome, or use the VS Code Live Server extension.
4. Test the sidebar navigation, dashboard, lead table, lead modal, calendar, Pulse chat and callback actions.

## Stack and rationale
- HTML for semantic page structure.
- CSS for responsive layout and components.
- Vanilla JavaScript for navigation, sample data, pagination, modal interactions, calendar navigation and demo chat.
- Chosen for rapid implementation under a short deadline and because the assignment explicitly permits plain HTML/CSS/JavaScript.

## Current limitations — complete before submission
- This is a starter scaffold, not a finished submission.
- The original `OnGround_CallCentre_App_Mock.html` was not available when this was created, so exact visual matching has not been verified.
- Sample lead/customer details and phone numbers are fictitious.
- Callback buttons use `tel:` to request that the operating system open a registered phone handler. This is not an in-browser VoIP call, and does not prove a connected call.
- The assignment calls for a working calling feature. Configure and test an actual calling mechanism before claiming this requirement is complete. Browser VoIP typically requires a voice provider or signalling infrastructure; never put provider secrets in front-end JavaScript.
- Some buttons currently show a placeholder toast and need real behaviour or should be removed before final submission.
- No AI-to-human voice agent is implemented in this starter.

## AI tools
Disclose the AI tools actually used during development, and be prepared to explain and modify the code yourself.

## Before submission
- Compare every screen with the supplied mock if you obtain it.
- Test all navigation and interactions in Chrome at laptop width and phone width.
- Replace fictitious data where appropriate and never call real people without permission.
- Complete the calling integration and document its setup and limitations accurately.
- Commit your work as you go and share the GitHub repository with the hiring contact.
