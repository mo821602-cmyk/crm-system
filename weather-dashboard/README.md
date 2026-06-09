
# 🌤️ Weather Dashboard

A modern, responsive weather dashboard application that fetches real-time weather data from the OpenWeatherMap API. Built with Node.js, Express, and Vanilla JavaScript.

## Features

✨ **Core Features:**
- 🌍 Real-time weather data from OpenWeatherMap API
- 📍 Geolocation support (use current location)
- 🔍 City search with autocomplete suggestions
- 📊 5-day weather forecast
- 🏙️ Compare weather across multiple cities
- 💾 Smart caching system for performance
- 📱 Fully responsive design
- 🎨 Modern gradient UI with smooth animations

## Weather Information Displayed

- Current temperature and "feels like" temperature
- Weather condition (sunny, rainy, cloudy, etc.)
- Humidity, pressure, and wind speed
- Visibility and UV index
- Sunrise and sunset times
- Min/max daily temperatures
- 5-day forecast with hourly details
- Rain probability

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **API:** OpenWeatherMap API
- **Caching:** In-memory cache with TTL
- **Features:** CORS, Compression, Error Handling

## Prerequisites

- Node.js 18+
- npm 9+
- Free API key from OpenWeatherMap (https://openweathermap.org/api)

## Installation

1. **Get OpenWeatherMap API Key**
   - Visit https://openweathermap.org/api
   - Sign up for free account
   - Generate API key from your account

2. **Clone/Navigate to weather-dashboard directory**
```bash
cd weather-dashboard
```

3. **Install dependencies**
```bash
npm install
```

4. **Create .env file**
```bash
cp .env.example .env
```

5. **Configure environment variables**
```env
OPENWEATHER_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
UNITS=metric
LANGUAGE=en
CACHE_DURATION=600
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Access the dashboard at: `http://localhost:3001`

## Configuration

### Environment Variables

```env
# Required
OPENWEATHER_API_KEY=your_openweathermap_api_key_here

# Optional (with defaults)
PORT=3001
NODE_ENV=development
UNITS=metric           # metric, imperial, standard
LANGUAGE=en            # en, es, fr, de, it, ru, zh_cn, zh_tw, etc.
CACHE_DURATION=600     # Cache duration in seconds
REDIS_HOST=localhost   # For Redis caching (optional)
REDIS_PORT=6379        # Redis port (optional)
```

### Units
- **metric:** Temperature in Celsius, speed in m/s (default)
- **imperial:** Temperature in Fahrenheit, speed in mph
- **standard:** Temperature in Kelvin, speed in m/s

## API Endpoints

### Get Current Weather
```
GET /api/weather/current?city=London
```

**Response:**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": {
      "current": 15,
      "feels_like": 12,
      "min": 10,
      "max": 18
    },
    "humidity": 72,
    "pressure": 1013,
    "wind": {
      "speed": 4.5,
      "direction": 230,
      "gust": 8.2
    },
    "weather": {
      "main": "Clouds",
      "description": "overcast clouds",
      "icon": "04d",
      "icon_url": "https://openweathermap.org/img/wn/04d@4x.png"
    },
    "sunrise": "2024-01-15T07:30:00.000Z",
    "sunset": "2024-01-15T16:45:00.000Z"
  },
  "cached": false,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Get Weather by Coordinates
```
GET /api/weather/coordinates?lat=51.5074&lon=-0.1278
```

### Get 5-Day Forecast
```
GET /api/weather/forecast?city=London
```

### Get Multiple Cities Weather
```
GET /api/weather/multiple?cities=London,Paris,Tokyo
```

**Maximum:** 10 cities per request

### Cache Statistics
```
GET /api/weather/cache/stats
```

### Clear Cache
```
DELETE /api/weather/cache/clear
```

### API Info
```
GET /api/weather/info
```

## Project Structure

```
weather-dashboard/
├── public/
│   ├── index.html       # Main dashboard page
│   ├── style.css        # Styling
│   └── app.js           # Frontend JavaScript
├── services/
│   ├── weatherService.js    # OpenWeatherMap API calls
│   └── cacheService.js      # Caching logic
├── routes/
│   └── weather.js       # API routes
├── server.js            # Express server
├── package.json         # Dependencies
├── .env.example         # Environment template
└── README.md            # Documentation
```

## Usage

### Search for a City
1. Enter city name in search box
2. Select from autocomplete suggestions or press Enter
3. View current weather and 5-day forecast

### Use Current Location
1. Click the 📍 button
2. Allow geolocation permission
3. Dashboard automatically loads weather for your location

### Compare Cities
1. Click "+ Add City" button
2. Enter city name in modal
3. Click "Add" to add to comparison
4. Click "✕" on city card to remove

### View Cache Statistics
1. Click "📊 Cache Stats" button
2. View cache size and active keys
3. Click "Clear Cache" to empty cache

## Performance Features

- **Smart Caching:** In-memory cache with TTL (Time To Live)
- **Response Compression:** Gzip compression for API responses
- **Optimized Images:** Weather icons from CDN
- **Lazy Loading:** Forecast loaded on demand
- **Debounced Search:** Prevents excessive API calls

## Error Handling

- City not found (404)
- Invalid API key (401)
- Rate limiting (429)
- Network timeouts
- Invalid coordinates
- Missing parameters

## Responsive Design

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (480px - 767px)
- Small mobile (< 480px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] User accounts and saved locations
- [ ] Weather alerts and notifications
- [ ] Historical weather data
- [ ] Air quality index
- [ ] Pollen forecast
- [ ] Weather maps and radar
- [ ] Mobile app
- [ ] Voice search

## Troubleshooting

### "API key is not set"
- Add `OPENWEATHER_API_KEY` to .env file
- Get free key at https://openweathermap.org/api

### "City not found"
- Check city spelling
- Try searching in English
- Use country code: "London, UK"

### Cache not working
- Check CACHE_DURATION setting
- Clear cache using API
- Restart server

### Slow response
- Check internet connection
- API rate limits might be reached
- Wait a moment and retry

## API Rate Limits

Free tier: 60 calls/minute per API key

## License

ISC

## Support

For issues and questions, please create an issue in the repository.

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Author:** mo821602-cmyk
