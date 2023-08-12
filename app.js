const container = document.getElementById("wet");
const mapContainer = document.querySelector("#map");
const wrapperContainer = document.querySelector("#wrapper");

const apiKey = "API-KEY";
const googleApiKey = "API-KEY";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
document.getElementById("search-btn").addEventListener("click", getWeather);


window.addEventListener("load", () => {
  const locationPromise = fetch("https://ipinfo.io/json");
  
  locationPromise
    .then(response => response.json())
    .then(locationData => {
      const city = locationData.city;
      return Promise.all([
        fetchWeatherData(city),
        fetchForecastData(city)
      ]);
    })
    .then(([weatherData, forecastData]) => {
      renderWeather(weatherData);
      renderForecast(forecastData.daily);
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data.");
    });
});



async function getWeather() {
  try {
    const city = document.getElementById("weather").value;
    const [weatherData, forecastData] = await Promise.all([
      fetchWeatherData(city),
      fetchForecastData(city),
    ]);

    renderWeather(weatherData);
    renderForecast(forecastData.daily);
  } catch (err) {
    alert("Please enter a valid City name");
  }
}

async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

async function fetchWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  return fetchData(url);
}

async function fetchForecastData(city) {
  const weatherData = await fetchWeatherData(city);
  const { lat, lon } = weatherData.coord;
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return fetchData(url);
}

function renderWeather(data) {
  container.innerHTML = "";
  mapContainer.innerHTML = "";

  const { name, main, wind, clouds, weather } = data;

  const nameElement = document.createElement("h2");
  nameElement.innerText = name;

  const maxTempElement = createWeatherElement(`🌡️  ${main.temp_max} °C`);
  const windElement = createWeatherElement(`🌬️  ${wind.speed} km/s`);
  const cloudsElement = createWeatherElement(`🌩️  ${clouds.all}`);
  
  const sunriseElement = document.createElement("img");
  sunriseElement.src = `http://openweathermap.org/img/w/${weather[0].icon}.png`;

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.google.com/maps/embed/v1/place?key=${googleApiKey}&q=${data.name}`;

  mapContainer.appendChild(iframe);
  container.append(nameElement, maxTempElement, windElement, cloudsElement, sunriseElement);
}

function createWeatherElement(text) {
  const element = document.createElement("p");
  element.innerText = text;
  return element;
}

function renderForecast(forecast) {
  wrapperContainer.innerHTML = "";

  const today = new Date().getDay();
  
  forecast.forEach((dayData, index) => {
    const box = document.createElement("div");
    box.classList.add("box");

    const { icon } = dayData.weather[0];
    const iconurl = `http://openweathermap.org/img/w/${icon}.png`;

    const day = createWeatherElement(dayNames[(today + index) % 7]);

    const photo = document.createElement("img");
    photo.src = iconurl;
    photo.classList.add("photo");

    const min = createWeatherElement(`${dayData.temp.min}°`);
    const max = createWeatherElement(`${dayData.temp.max}°`);

    box.append(day, photo, max, min);
    wrapperContainer.appendChild(box);
  });
}
