# Weather App

A simple weather app with city search, current weather, 5-day forecast, favorite cities, and a visible log of all API calls.

## Features

- **Search city** – Type a city name and search for current weather and forecast
- **Temperature & humidity** – Current temp, feels-like, humidity, and wind
- **5-day forecast** – Daily forecast with high/low and conditions
- **Favorite cities** – Save cities and click them to search again
- **API calls** – Every request is shown in the “API calls” section (method, URL, time, status)

## Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api). Sign up and create a key under “API keys”.
2. Open `index.html` in a browser (or use a local server if you prefer).
3. Enter your API key in the “API key” field and click **Save**. The page will reload.
4. Search for any city and use the app.

## Usage

- **Search**: Type a city name and click **Search** or press Enter.
- **Add favorite**: After searching, click **Add favorite** to save the city. Click a favorite to search it again; click **Remove** to delete it.
- **API calls**: The bottom section lists each request (GET, URL with key hidden, timestamp, and status). Use **Clear log** to empty the list.

## Files

- `index.html` – Markup and structure
- `styles.css` – Layout and styling
- `app.js` – Weather API calls, favorites (localStorage), and API logging

## API

The app uses the OpenWeatherMap API:

- Current weather: `GET /data/2.5/weather?q={city}&units=metric&appid=...`
- 5-day forecast: `GET /data/2.5/forecast?lat=&lon=&units=metric&appid=...`

Your API key is stored only in your browser’s `localStorage` and is sent only to OpenWeatherMap.
