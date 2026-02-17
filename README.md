# Al-Rayyan API

A simple API for calculating Islamic prayer times based on user location.

## Features

- Automatic location detection from IP address
- Prayer times calculation using Adhan library
- Timezone-aware formatting
- Egyptian calculation method

## Installation

```bash
npm install
```

## Development

Run the server with auto-restart on file changes:

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoint

GET `/api/v1/prayer-times`

Returns prayer times for the user's location based on their IP address.

## Folder Structure

- `index.js` - Main application entry point
- `routes/` - API route handlers
  - `prayerTimes.js` - Prayer times endpoint logic
# alrayyan-api
