# RoadWatch

RoadWatch is an AI-powered civic road transparency project inspired by the reference images. It lets citizens and authorities monitor road quality, inspect contractor and budget data, file GPS-tagged complaints, and ask an AI assistant about repairs and accountability.

## Tech Stack

- Backend: FastAPI, Pydantic, Gemini API via `google-genai`
- Frontend: React, Vite, Leaflet.js, React Leaflet, Lucide icons
- AI/ML: Gemini chat over road records, Gemini multimodal image analysis for complaint photos, fallback rule-based scoring when no API key is configured
- Maps: Leaflet with OpenStreetMap tiles

## Project Structure

```text
roadwatch/
+-- backend/
|   +-- app/
|   |   +-- main.py
|   |   +-- config.py
|   |   +-- models.py
|   |   +-- routers/
|   |   +-- services/
|   |   +-- data/
|   +-- requirements.txt
|   +-- .env.example
+-- frontend/
    +-- src/
    |   +-- components/
    |   +-- pages/
    |   +-- hooks/
    |   +-- services/
    |   +-- styles/
    +-- package.json
    +-- vite.config.js
```

## Gemini Free Tier Setup

Google's Gemini docs say you can create a free API key in Google AI Studio, and the official SDK can read `GEMINI_API_KEY` or `GOOGLE_API_KEY` from the environment. Keep the key in the backend `.env` only. Do not put it in React.

Official references:

- [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini API pricing and free tier](https://ai.google.dev/gemini-api/docs/pricing)

## Run Locally in VS Code

1. Open the project folder in VS Code:

```bash
cd /Users/rakshithkr/Documents/Codex/2026-05-18/files-mentioned-by-the-user-whatsapp/roadwatch
code .
```

2. Start the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

3. Add your Gemini key inside `backend/.env`:

```env
GEMINI_API_KEY=paste_your_key_here
GEMINI_MODEL=gemini-2.0-flash
FRONTEND_ORIGIN=http://localhost:5173
```

4. Run FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend URL: [http://localhost:8000](http://localhost:8000)  
API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

5. Start the frontend in a second VS Code terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: [http://localhost:5173](http://localhost:5173)

## How the AI/ML Part Works

1. `POST /ai/chat` receives a question and optional `road_id`.
2. The backend builds a compact road-data context from `mock_data.py`.
3. If `GEMINI_API_KEY` exists, Gemini answers using only that context.
4. If no key exists or Gemini fails, the app returns a deterministic fallback answer.
5. `POST /ai/analyze-image` accepts a complaint photo.
6. Gemini analyzes the image for damage type, severity, confidence, and suggested action.
7. The frontend shows the analysis inside the complaint modal before submission.

## Suggested Demo Flow

1. Open the map view.
2. Click a road segment or road alert.
3. Inspect contractor, authority, budget, complaints, and quality score.
4. Click `File Complaint`.
5. Upload a road image and click `Analyze Image with AI`.
6. Submit the complaint.
7. Open Analytics to see budget and contractor performance.
8. Open AI Assistant and ask: `Which contractor needs urgent review?`
