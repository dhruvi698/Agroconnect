# AgroConnect

A farmer portal built with Flask and PostgreSQL. Farmers can register, log in, run simple farm tools, save their reports, and view charts of their data.

## Features

- Register and log in (passwords are hashed)
- Dashboard with your farm profile
- Tools: soil health, crop recommendation, yield prediction, irrigation, weather
- Farm reports: every analysis you run is saved and can be viewed later
- Analytics page with 4 interactive charts (Plotly)

## Tech Stack

- Backend: Python, Flask, Flask-SQLAlchemy, Flask-Login, Flask-Bcrypt
- Database: PostgreSQL
- Frontend: HTML, CSS, JavaScript, Plotly.js

## Project Structure

```
agroconnect/
├── backend/
│   ├── app.py          # Flask app and API routes
│   ├── models.py       # User and AnalysisReport tables
│   └── test_api.py
├── frontend/
│   ├── templates/      # HTML pages
│   └── static/         # CSS, JS, images
├── extra/              # Project notes
├── requirements.txt
├── start.sh            # One-command run script
└── .env.example
```

## How to Run

You need Python 3 and PostgreSQL installed.

**1. Clone the project**
```bash
git clone https://github.com/<your-username>/agroconnect.git
cd agroconnect
```

**2. Create the database**
```bash
createdb agroconnect
```

**3. Set up environment variables**
```bash
cp .env.example .env
```
Open `.env` and set your own `SECRET_KEY` and `DATABASE_URL`.

**4. Start the app**
```bash
bash start.sh
```
This creates a virtual environment, installs the packages, and starts the server. Tables are created automatically on first run.

**5. Open in browser**

http://127.0.0.1:5000

## Pages

| Page | URL |
|------|-----|
| Home | `/` |
| Login / Register | `/login`, `/register` |
| Dashboard | `/dashboard` |
| Soil Health | `/soil-health` |
| Crop Recommendation | `/crop-rec` |
| Yield Prediction | `/yield-prediction` |
| Irrigation | `/irrigation` |
| Weather | `/weather` |
| Farm Reports | `/farm-reports` |
| Analytics | `/analytics` |

