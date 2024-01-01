declare var Swal: any;

let x: number,
    loadingDiv = document.getElementById("loadingDiv") as HTMLDivElement,
    body = document.querySelector("body") as HTMLBodyElement;

const
    cityInput = document.querySelector(".city-input") as HTMLInputElement,
    searchButton = document.querySelector(".search-btn") as HTMLElement,
    locationButton = document.querySelector(".location-btn") as HTMLElement,
    currentWeatherDiv = document.querySelector(".current-weather") as HTMLElement,
    weatherCardsDiv = document.querySelector(".weather-cards") as HTMLElement,
    API_KEY: string = "c2b75a33d377561989179362d9667d1e"; // API key for OpenWeatherMap API


loadingDiv.style.opacity = '1';

function removeLoadingDiv(): void {

    // when first loading if there was any error reset input field 
    cityInput.value = "";

    const fadeEffect = setInterval(function () {

        loadingDiv = document.getElementById("loadingDiv") as HTMLDivElement;

        if (loadingDiv) {
            x = +loadingDiv.style.opacity;

            if (x > 0) {
                loadingDiv.style.opacity = `${x - 0.1}`;
            } else {
                clearInterval(fadeEffect);
                loadingDiv.remove();
                body.style.overflowY = 'visible';
            }

        }
    }, 30);
}


const getCityCoordinates = (): void => {

    const cityName: string = cityInput.value.trim();

    if (cityName === "") return;

    const API_URL: string = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;


    // Get entered city coordinates (latitude, longitude, and name) from the API response
    // latitude => خطوط الطول  
    // longitude => خطوط العرض  

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if (!data.length) {
                Swal.fire({
                    title: `No coordinates found for ${cityName}`,
                    icon: "error",
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false,
                })
            } else {
                const { lat, lon, name }: { lat: number, lon: number, name: string } = data[0];
                getWeatherDetails(name, lat, lon);
            }
        }).catch(() => {
            removeLoadingDiv();
            Swal.fire({
                title: "An error occurred while fetching the coordinates, please try again later!",
                icon: "error",
                confirmButtonText: 'Ok',
                allowOutsideClick: false,
            })
        });
}

const getWeatherDetails = (cityName: string, latitude: number, longitude: number) => {

    const WEATHER_API_URL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {

            // Filter the forecasts to get only one forecast per day
            // console.log(data);

            const uniqueForecastDays: any[] = [];

            const sixDaysForecast = data.list.filter((forecast: any) => {

                const forecastDate = new Date(forecast.dt_txt).getDate();

                // console.log(forecastDate);

                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }

            });

            // console.log(sixDaysForecast);


            // Clearing previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Creating weather cards and adding them to the DOM
            sixDaysForecast.forEach((weatherItem: any, index: number) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
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
            })
        });
}


const createWeatherCard = (cityName: any, weatherItem: any, index: number) => {
    if (index === 0) {
        // HTML for the main weather card

        // °C = Kelvin - 273.15


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
    } else {
        // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6> 
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {

            // console.log(position);
             
            const { latitude, longitude } = position.coords; // Get coordinates of user location

            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    // console.log('getUserCoordinates' , data);
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    Swal.fire({
                        title: `An error occurred while fetching the city name!`,
                        icon: "error",
                        confirmButtonText: 'Ok',
                        allowOutsideClick: false,
                    })

                });
        },
        error => { // Show alert if user denied the location permission

            // console.log(error);

            if (error.code === error.PERMISSION_DENIED) {


                Swal.fire({
                    title: `Geolocation request denied. Please reset location permission to grant access again.`,
                    icon: "error",
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false,
                })
            } else {

                Swal.fire({
                    title: `Geolocation request error. Please reset location permission.`,
                    icon: "error",
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false,
                })

            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);


searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

cityInput.value = 'Damascus';
getCityCoordinates();
