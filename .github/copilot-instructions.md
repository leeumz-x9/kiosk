# Copilot Instructions for College Kiosk ProMax

## Project Overview
- **Monorepo** for a smart kiosk: React/Vite frontend (`src/`), Python IoT server (`pi5_server/`), Firebase backend, and AI integrations.
- **Frontend**: React (Vite), heavy use of components in `src/components/`. Key files: `App.jsx`, `main.jsx`, `config.js`, `firebase.js`.
- **Backend/IoT**: Python Flask server in `pi5_server/` (see `app.py`, `app_imx500.py`). Integrates with hardware (LED, sensors) and Firebase.
- **AI/Avatar**: Uses face-api.js models (in `public/models/`), OpenAI API (optional, via `config.js`), and ResponsiveVoice for TTS.

## Key Workflows
- **Install**: `npm install` (frontend), `pip install -r pi5_server/requirements.txt` (IoT server)
- **Run Dev**: `npm run dev` (frontend, http://localhost:3000), `sudo python3 app.py` (IoT server)
- **Build**: `npm run build` (frontend)
- **Deploy**: `firebase deploy` (after build)
- **IoT Auto-start**: Use systemd service (see `SETUP.md`)

## Project-Specific Conventions
- **Face models**: Must be manually downloaded to `public/models/` (see `SETUP.md`)
- **Firebase config**: Set in `src/config.js` (see example in `README.md`)
- **OpenAI/Voice**: API keys in `src/config.js` and `index.html` (for ResponsiveVoice)
- **Component structure**: Each major UI feature is a separate file in `src/components/` (e.g., `FaceDetection.jsx`, `Avatar3D.jsx`, `Heatmap.jsx`)
- **IoT endpoints**: Documented in `pi5_server/README.md` (e.g., `/api/status`, `/api/led`)
- **Python server**: Expects `firebase-credentials.json` in `pi5_server/` and correct `databaseURL` in `app.py`

## Integration & Data Flow
- **Frontend <-> Firebase**: Uses `firebase.js` and `firebaseService.js` for Firestore/Realtime DB.
- **Frontend <-> IoT**: Communicates via REST API to Pi5 server (see endpoints in `pi5_server/README.md`).
- **AI/Avatar**: Loads models from `public/models/`, uses OpenAI for chat, ResponsiveVoice for TTS.
- **Admin tools**: Scripts in root (e.g., `seed-firebase.js`, `clear-firestore.js`) for DB management.

## Troubleshooting & Tips
- **Face detection not working?** Check models in `public/models/` and camera permissions.
- **Firebase errors?** Double-check `src/config.js` and Firebase project setup.
- **IoT not responding?** Check wiring, run with `sudo`, and inspect logs (`journalctl -u kiosk-iot.service -f`).
- **Avatar not speaking?** Check OpenAI and ResponsiveVoice API keys.

## References
- See `README.md` and `SETUP.md` for full setup, troubleshooting, and hardware details.
- See `pi5_server/README.md` for IoT server and API usage.
- See `public/models/` for required face-api.js model files.

---

**When in doubt, reference the guides above and prefer project-specific scripts and conventions over generic approaches.**
