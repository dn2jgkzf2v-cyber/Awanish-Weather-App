# Awanish Weather App — Weather Dashboard

A responsive weather dashboard for Indian states and cities. Built with React + Vite and powered by the free Open-Meteo forecast and geocoding APIs. No API key is required.

## Run locally
1. Install Node.js (18+ recommended).
2. Open this project folder in a terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL shown in the terminal.

## Deploy with GitHub + Vercel
1. Create a new repository on GitHub.
2. Upload/extract all files and folders from this ZIP into the repository root (do not upload the ZIP itself).
3. In Vercel, choose **Add New → Project**, import the GitHub repository.
4. Vercel should detect **Vite** automatically.
5. Use these settings if asked:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
6. Click **Deploy**. Future GitHub pushes will trigger deployments.

## Features
- State and city selection for a broad list of Indian locations.
- Current conditions, feels-like temperature, humidity, wind, pressure, UV and sunrise/sunset.
- Hourly forecast (next 24 hours).
- Daily forecast (up to 16 days), plus 7-day weekly view.
- Monthly tab with a clear explanation of forecast-range limitations and a summary of available days.
- Celsius/Fahrenheit toggle, responsive layout, loading and error states.

## Forecast limitation
The free Open-Meteo forecast endpoint provides up to 16 days of daily forecast data. It does **not** provide a reliable day-by-day 30-day forecast. The Monthly tab therefore reports the available forecast-window summary rather than inventing 30-day predictions. A true 30-day forecast would require a provider that offers that range, often through a paid plan.

## Data and privacy
Weather data and geocoding are fetched from `api.open-meteo.com` and `geocoding-api.open-meteo.com`. Your selected state/city is stored only in browser local storage.
