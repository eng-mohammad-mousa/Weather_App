"use strict";
let x, loadingDiv = document.getElementById("loadingDiv"), body = document.querySelector("body");
const cityInput = document.querySelector(".city-input"), searchButton = document.querySelector(".search-btn"), locationButton = document.querySelector(".location-btn"), currentWeatherDiv = document.querySelector(".current-weather"), weatherCardsDiv = document.querySelector(".weather-cards"), API_KEY = "c2b75a33d377561989179362d9667d1e";
loadingDiv.style.opacity = '1';
function removeLoadingDiv() {
    cityInput.value = "";
    const fadeEffect = setInterval(function () {
        loadingDiv = document.getElementById("loadingDiv");
        if (loadingDiv) {
            x = +loadingDiv.style.opacity;
            if (x > 0) {
                loadingDiv.style.opacity = `${x - 0.1}`;
            }
            else {
                clearInterval(fadeEffect);
                loadingDiv.remove();
                body.style.overflowY = 'visible';
            }
        }
    }, 30);
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "")
        return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
        if (!data.length) {
            Swal.fire({
                title: `No coordinates found for ${cityName}`,
                icon: "error",
                confirmButtonText: 'Ok',
                allowOutsideClick: false,
            });
        }
        else {
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        }
    }).catch(() => {
        removeLoadingDiv();
        Swal.fire({
            title: "An error occurred while fetching the coordinates, please try again later!",
            icon: "error",
            confirmButtonText: 'Ok',
            allowOutsideClick: false,
        });
    });
};
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
        const uniqueForecastDays = [];
        const sixDaysForecast = data.list.filter((forecast) => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        sixDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            }
            else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
        removeLoadingDiv();
    }).catch(() => {
        removeLoadingDiv();
        Swal.fire({
            title: "An error occurred while fetching the weather forecast!",
            icon: "error",
            confirmButtonText: 'Ok',
            allowOutsideClick: false,
        });
    });
};
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} : ${weatherItem.dt_txt.split(" ")[0]}</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else {
        return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6> 
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
};
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
            const { name } = data[0];
            getWeatherDetails(name, latitude, longitude);
        })
            .catch(() => {
            Swal.fire({
                title: `An error occurred while fetching the city name!`,
                icon: "error",
                confirmButtonText: 'Ok',
                allowOutsideClick: false,
            });
        });
    }, error => {
        if (error.code === error.PERMISSION_DENIED) {
            Swal.fire({
                title: `Geolocation request denied. Please reset location permission to grant access again.`,
                icon: "error",
                confirmButtonText: 'Ok',
                allowOutsideClick: false,
            });
        }
        else {
            Swal.fire({
                title: `Geolocation request error. Please reset location permission.`,
                icon: "error",
                confirmButtonText: 'Ok',
                allowOutsideClick: false,
            });
        }
    });
};
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
cityInput.value = 'Damascus';
getCityCoordinates();
