// ===============================================
// CONFIG & INITIALIZATION
// ===============================================

// API Configuration - Using OpenWeatherMap's free tier endpoints
const API_KEY = config.API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

// Verify API key existence early to prevent unnecessary API calls
console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    console.error('Please set your OpenWeatherMap API key in config.js');
    alert('Please set your OpenWeatherMap API key in config.js');
}

// ===============================================
// DOM ELEMENTS
// ===============================================

// Main elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const weatherWrapper = document.querySelector('.weather-wrapper');
const locationModal = document.getElementById('locationModal');
const allowLocationButton = document.getElementById('allow-location');
const denyLocationButton = document.getElementById('deny-location');
const closeModalButton = document.getElementById('close-modal');
const loadingOverlay = document.getElementById('loading-overlay');

// Current weather elements
const cityName = document.querySelector('.city-name');
const currentDate = document.querySelector('.current-date');
const currentTime = document.querySelector('.current-time');
const temperature = document.querySelector('.temperature');
const weatherIcon = document.getElementById('weather-icon-main');
const weatherDescription = document.querySelector('.weather-description');
const feelsLike = document.querySelector('.feels-like');
const humidity = document.querySelector('.humidity');
const windSpeed = document.querySelector('.wind-speed');
const pressure = document.querySelector('.pressure');

// Highlights elements
const sunrise = document.querySelector('.sunrise');
const sunset = document.querySelector('.sunset');
const uvValue = document.querySelector('.uv-value');
const uvLevel = document.querySelector('.uv-level');
const visibility = document.querySelector('.visibility');
const aqiValue = document.querySelector('.aqi-value');
const aqiLevel = document.querySelector('.aqi-level');

// Forecast elements
const forecastContainer = document.getElementById('forecast-container');
const hourlyContainer = document.getElementById('hourly-container');

// Map elements
const weatherMapContainer = document.getElementById('weather-map');
let map;
let marker;

// Time tracking variables for live clock functionality
let timeInterval;
let currentTimezone;

// ===============================================
// EVENT LISTENERS
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Show location permission modal on initial load
    showModal();
    
    // Check for saved location
    const savedLocation = localStorage.getItem('weatherLocation');
    if (savedLocation) {
        try {
            const locationData = JSON.parse(savedLocation);
            getWeatherByCoordinates(locationData.lat, locationData.lon);
        } catch (error) {
            console.error('Error parsing saved location:', error);
            localStorage.removeItem('weatherLocation');
            // Show Delhi weather by default
            getCoordinatesByCity('Delhi');
        }
    }
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city) {
        showLoading();
        getCoordinatesByCity(city)
            .catch(error => {
                console.error('Search error:', error);
            })
            .finally(() => {
                hideLoading();
            });
        searchInput.value = '';
    }
});

allowLocationButton.addEventListener('click', () => {
    hideModal();
    getUserLocation();
});

denyLocationButton.addEventListener('click', () => {
    hideModal();
});

closeModalButton.addEventListener('click', () => {
    hideModal();
});

// ===============================================
// MODAL FUNCTIONS
// ===============================================

function showModal() {
    locationModal.classList.add('show');
}

function hideModal() {
    locationModal.classList.remove('show');
}

// ===============================================
// LOADING FUNCTIONS
// ===============================================

function showLoading() {
    loadingOverlay.classList.add('show');
}

function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// ===============================================
// HELPER FUNCTIONS
// ===============================================

// Formats Unix timestamp into readable date (Day, Date Month)
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day}, ${dateNum} ${month}`;
}

// Converts Unix timestamp to 12-hour time format with AM/PM
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
}

// Converts Kelvin to Celsius - OpenWeatherMap provides temperatures in Kelvin
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Maps UV index values to human-readable levels and matching colors
function getUVIndexLevel(uvIndex) {
    if (uvIndex <= 2) return { level: 'Low', color: '#3db83a' };
    if (uvIndex <= 5) return { level: 'Moderate', color: '#f7d83e' };
    if (uvIndex <= 7) return { level: 'High', color: '#f5a742' };
    if (uvIndex <= 10) return { level: 'Very High', color: '#df513f' };
    return { level: 'Extreme', color: '#9c3ab0' };
}

// Maps Air Quality Index values to human-readable levels and matching colors
function getAQILevel(aqi) {
    switch (aqi) {
        case 1: return { level: 'Good', color: '#3db83a' };
        case 2: return { level: 'Fair', color: '#f7d83e' };
        case 3: return { level: 'Moderate', color: '#f5a742' };
        case 4: return { level: 'Poor', color: '#df513f' };
        case 5: return { level: 'Very Poor', color: '#9c3ab0' };
        default: return { level: 'Unknown', color: '#777' };
    }
}

// Changes app background based on weather condition code from API
function setWeatherBackground(weatherCode) {
    weatherWrapper.className = 'weather-wrapper';
    
    if (weatherCode >= 200 && weatherCode < 300) {
        weatherWrapper.classList.add('thunderstorm');
    } else if (weatherCode >= 300 && weatherCode < 600) {
        weatherWrapper.classList.add('rain');
    } else if (weatherCode >= 600 && weatherCode < 700) {
        weatherWrapper.classList.add('snow');
    } else if (weatherCode >= 700 && weatherCode < 800) {
        weatherWrapper.classList.add('mist');
    } else if (weatherCode === 800) {
        weatherWrapper.classList.add('clear');
    } else if (weatherCode > 800) {
        weatherWrapper.classList.add('clouds');
    }
}

// ===============================================
// API CALLS & DATA FETCHING
// ===============================================

// Gets user's current location using browser's Geolocation API
function getUserLocation() {
    showLoading(); // Show loading indicator while getting location
    
    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
            // Success callback
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log('Location detected:', { lat, lon });
                
                localStorage.setItem('weatherLocation', JSON.stringify({ lat, lon }));
                getWeatherByCoordinates(lat, lon)
                    .finally(() => {
                        hideLoading(); // Hide loading indicator
                    });
            },
            // Error callback
            (error) => {
                console.error('Geolocation error:', error);
                localStorage.removeItem('weatherLocation');
                hideLoading(); // Hide loading indicator
                
                alert("We couldn't fetch your current location. Please enable location access in your device settings or enter your city manually to get accurate weather updates.");
                getCoordinatesByCity('Delhi');
            },
            options
        );
    } else {
        hideLoading(); // Hide loading indicator
        alert("We couldn't fetch your current location. Please enable location access in your device settings or enter your city manually to get accurate weather updates.");
        getCoordinatesByCity('Delhi');
    }
}

// Converts city name to coordinates using OpenWeatherMap's Geocoding API
async function getCoordinatesByCity(city) {
    try {
        console.log('Fetching coordinates for:', city);
        const url = `${GEO_URL}/direct?q=${city}&limit=1&appid=${API_KEY}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        console.log('Coordinates response:', data);
        
        // Handle case when the city is not found in the API database
        if (!data || data.length === 0) {
            alert(`City "${city}" not found. Try searching for a nearby larger city or district.`);
            throw new Error('City not found');
        }
        
        // Call getWeatherByCoordinates with the returned coordinates
        const { lat, lon, name } = data[0];
        await getWeatherByCoordinates(lat, lon);
        
        return {
            lat: data[0].lat,
            lon: data[0].lon,
            name: data[0].name
        };
    } catch (error) {
        console.error('Error getting coordinates:', error);
        if (error.message !== 'City not found') {
            alert(`Error: ${error.message}`);
        }
        throw error;
    }
}

// Fetches weather data for given coordinates from multiple API endpoints
async function getWeatherByCoordinates(lat, lon) {
    try {
        console.log('Fetching weather for coordinates:', lat, lon);
        
        // Fetch current weather
        const currentWeatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        console.log('Current weather URL:', currentWeatherUrl);
        
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        if (!currentWeatherResponse.ok) {
            const errorText = await currentWeatherResponse.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${currentWeatherResponse.status}, message: ${errorText}`);
        }
        const currentWeatherData = await currentWeatherResponse.json();
        console.log('Current weather response:', currentWeatherData);
        
        // Fetch 5-day forecast data (free tier provides 3-hour intervals)
        const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        console.log('Forecast URL:', forecastUrl);
        
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            const errorText = await forecastResponse.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${forecastResponse.status}, message: ${errorText}`);
        }
        const forecastData = await forecastResponse.json();
        console.log('Forecast response:', forecastData);
        
        // Fetch air quality data
        const airQualityUrl = `${AIR_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        console.log('Air quality URL:', airQualityUrl);
        
        const airQualityResponse = await fetch(airQualityUrl);
        if (!airQualityResponse.ok) {
            const errorText = await airQualityResponse.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${airQualityResponse.status}, message: ${errorText}`);
        }
        const airQualityData = await airQualityResponse.json();
        console.log('Air quality response:', airQualityData);
        
        // Process all fetched data and update the UI
        updateWeatherUI(currentWeatherData, forecastData, airQualityData);
        
        return {
            current: currentWeatherData,
            forecast: forecastData,
            airQuality: airQualityData
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

// ===============================================
// UI UPDATE FUNCTIONS
// ===============================================

// Updates all UI elements with the fetched weather data
function updateWeatherUI(currentWeather, forecastData, airQualityData) {
    // Set weather background based on condition code
    setWeatherBackground(currentWeather.weather[0].id);
    
    // Update current weather section
    cityName.textContent = `${currentWeather.name}, ${currentWeather.sys.country}`;
    currentDate.textContent = formatDate(currentWeather.dt);
    temperature.textContent = kelvinToCelsius(currentWeather.main.temp);
    weatherIcon.src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
    weatherDescription.textContent = currentWeather.weather[0].description;
    feelsLike.textContent = `${kelvinToCelsius(currentWeather.main.feels_like)}°C`;
    humidity.textContent = `${currentWeather.main.humidity}%`;
    windSpeed.textContent = `${Math.round(currentWeather.wind.speed * 3.6)} km/h`;
    pressure.textContent = `${currentWeather.main.pressure} hPa`;
    
    // Update timezone and start local time display
    currentTimezone = currentWeather.timezone;
    updateLocalTime();
    
    // Clear any existing interval before setting a new one to prevent memory leaks
    if (timeInterval) {
        clearInterval(timeInterval);
    }
    
    // Update the time every second for live clock effect
    timeInterval = setInterval(updateLocalTime, 1000);
    
    // Update highlights section
    sunrise.textContent = formatTime(currentWeather.sys.sunrise);
    sunset.textContent = formatTime(currentWeather.sys.sunset);
    
    // Estimate UV index as it's not available in the free API tier
    // Algorithm uses time of day and weather conditions to approximate UV levels
    const currentHour = new Date().getHours();
    let estimatedUV = 0;
    if (currentHour >= 10 && currentHour <= 16) {
        if (currentWeather.weather[0].id === 800) { // clear sky
            estimatedUV = 8; // high during clear days
        } else if (currentWeather.weather[0].id > 800) { // clouds
            estimatedUV = 4; // moderate during cloudy days
        } else { // rain, snow, etc
            estimatedUV = 2; // low during bad weather
        }
    } else if ((currentHour >= 7 && currentHour < 10) || (currentHour > 16 && currentHour <= 19)) {
        estimatedUV = 3; // moderate morning/evening
    }
    
    const uvIndexInfo = getUVIndexLevel(estimatedUV);
    uvValue.textContent = estimatedUV;
    uvLevel.textContent = uvIndexInfo.level;
    uvLevel.style.backgroundColor = uvIndexInfo.color;
    
    // Update visibility (convert from meters to kilometers)
    visibility.textContent = `${(currentWeather.visibility / 1000).toFixed(1)} km`;
    
    // Update air quality if available
    if (airQualityData && airQualityData.list && airQualityData.list.length > 0) {
        const aqi = airQualityData.list[0].main.aqi;
        const aqiInfo = getAQILevel(aqi);
        aqiValue.textContent = aqi;
        aqiLevel.textContent = aqiInfo.level;
        aqiLevel.style.backgroundColor = aqiInfo.color;
    }
    
    // Update map with the location
    updateMap(currentWeather.coord.lat, currentWeather.coord.lon, currentWeather.name);
    
    // Update 5-day forecast using free forecast API data
    updateForecastFromFreeAPI(forecastData);
    
    // Update hourly forecast (next 24 hours from the 3-hour forecast)
    updateHourlyForecastFromFreeAPI(forecastData);
}

// Processes 3-hour forecast data into daily forecasts by finding min/max temps per day
function updateForecastFromFreeAPI(forecastData) {
    forecastContainer.innerHTML = '';
    
    // Group forecast data by day (using the date part of dt_txt)
    // This is necessary because the free API provides data in 3-hour increments
    const dailyData = {};
    
    forecastData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = {
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                dt: item.dt
            };
        } else {
            // Track lowest and highest temperatures for each day
            dailyData[date].temp_min = Math.min(dailyData[date].temp_min, item.main.temp_min);
            dailyData[date].temp_max = Math.max(dailyData[date].temp_max, item.main.temp_max);
        }
    });
    
    // Convert to array and take first 5 days
    const dailyForecast = Object.keys(dailyData)
        .slice(0, 5)
        .map(date => ({
            dt: dailyData[date].dt,
            temp: {
                min: dailyData[date].temp_min,
                max: dailyData[date].temp_max
            },
            weather: [{
                icon: dailyData[date].icon,
                description: dailyData[date].description
            }]
        }));
    
    // Create forecast cards for each day
    dailyForecast.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            </div>
            <div class="forecast-temp">
                <span class="max-temp">${kelvinToCelsius(day.temp.max)}°</span>
                <span class="min-temp">${kelvinToCelsius(day.temp.min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Creates hourly forecast cards using the 3-hour interval data available in the free API
function updateHourlyForecastFromFreeAPI(forecastData) {
    hourlyContainer.innerHTML = '';
    
    // Take the first 8 items (24 hours with 3-hour intervals)
    const hourlyItems = forecastData.list.slice(0, 8);
    
    hourlyItems.forEach(hour => {
        const date = new Date(hour.dt * 1000);
        const hourTime = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        
        hourlyItem.innerHTML = `
            <div class="hourly-time">${hourTime}</div>
            <div class="hourly-icon">
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            </div>
            <div class="hourly-temp">${kelvinToCelsius(hour.main.temp)}°</div>
        `;
        
        hourlyContainer.appendChild(hourlyItem);
    });
}

// ===============================================
// MAP FUNCTIONS
// ===============================================

// Initializes or updates the Leaflet.js map with the current weather location
function updateMap(lat, lon, cityName) {
    if (!map) {
        map = L.map('weather-map').setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        map.setView([lat, lon], 10);
        marker.setLatLng([lat, lon]);
    }
    
    marker.bindPopup(`<b>Your Location</b><br>${cityName}`).openPopup();
}

// ===============================================
// TIME FUNCTIONS
// ===============================================

// Calculates and displays the current local time at the weather location
function updateLocalTime() {
    if (currentTimezone !== undefined) {
        // Calculate local time using timezone offset (in seconds) from the API
        // This handles different time zones correctly, including DST differences
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utcTime + (1000 * currentTimezone));
        
        // Format time as HH:MM:SS AM/PM
        const timeString = localTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        currentTime.textContent = timeString;
    }
}

// ===============================================
// INITIALIZATION
// ===============================================

// Initialize the app by focusing on the search input for immediate user interaction
function init() {
    searchInput.focus();
}

init(); 