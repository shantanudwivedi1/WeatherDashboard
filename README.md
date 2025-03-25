# Weather Dashboard

A modern, responsive weather dashboard application that provides real-time weather information using the OpenWeatherMap API.


![Weather Dashboard Demo](https://via.placeholder.com/800x400?text=Weather+Dashboard+Demo)

## Features

### Core Features
- Real-time weather data from OpenWeatherMap
- Current weather conditions with detailed metrics
- 5-day weather forecast
- Hourly forecast for the next 24 hours
- Air quality index information
- UV index estimation
- Interactive map with location marker
- Responsive design for all devices
- Dynamic background based on current weather conditions
- Local time display for the selected location
- Geolocation support for automatic location detection

### Detailed Weather Information
1. **Current Weather**
   - Temperature with unit conversion
   - Weather description with icons
   - Feels like temperature
   - Humidity percentage
   - Wind speed and direction
   - Atmospheric pressure
   - Visibility distance

2. **Forecast Features**
   - 5-day weather forecast
   - Hourly forecast for 24 hours
   - Temperature trends
   - Weather condition predictions
   - Precipitation probability

3. **Environmental Data**
   - Air Quality Index (AQI) with levels
   - UV Index with safety recommendations
   - Sunrise and sunset times
   - Local time at searched location

4. **Map Features**
   - Interactive location marker
   - Zoomable interface
   - OpenStreetMap integration
   - Current location detection

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An API key from [OpenWeatherMap](https://openweathermap.org/api)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shantanudwivedi1/WeatherDashboard.git
   cd WeatherDashboard
   ```

2. Set up your API key:
   - Rename `config.sample.js` to `config.js`
   - Add your OpenWeatherMap API key:
   ```javascript
   const config = {
       API_KEY: 'YOUR_OPENWEATHERMAP_API_KEY'
   };
   ```

3. Open `index.html` in your browser

### Configuration
- Get your API key from [OpenWeatherMap](https://openweathermap.org/api)
- Enable necessary API services in your OpenWeatherMap account:
  - Current Weather Data
  - 5 Day / 3 Hour Forecast
  - Air Pollution API

## Usage

### Basic Usage
- **City Search**: Enter city name in the search bar
- **Current Location**: Click "Use My Location" button
- **Weather Details**: View current conditions and forecasts
- **Map View**: Interact with the location map

### Advanced Features
- Toggle between Celsius and Fahrenheit
- View hourly forecast by scrolling horizontally
- Check detailed air quality information
- Monitor UV index and safety recommendations
- Track sunrise and sunset times

## Technologies Used

- **Frontend**:
  - HTML5
  - CSS3 with modern layout techniques
  - Vanilla JavaScript (ES6+)
  
- **APIs & Libraries**:
  - [OpenWeatherMap API](https://openweathermap.org/api)
  - [Leaflet.js](https://leafletjs.com/) for maps
  - [OpenStreetMap](https://www.openstreetmap.org/)

## Project Structure

```
WeatherDashboard/
├── index.html          # Main HTML file
├── style.css          # Styles and layouts
├── script.js          # Main JavaScript file
├── config.sample.js   # API configuration template
├── README.md          # Documentation
└── assets/           # Images and icons
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request



## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Maps powered by [OpenStreetMap](https://www.openstreetmap.org/) and [Leaflet](https://leafletjs.com/)
- Icons from [OpenWeatherMap](https://openweathermap.org/)

## Contact

For questions about this project, please open an issue in the repository. 
