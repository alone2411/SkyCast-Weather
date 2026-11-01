// 1. Create a free key at https://openweathermap.org/api
// 2. Paste it between the quotes below.
const API_KEY = "15b8e1009e42e180610fddeb11746eea";

const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const elements = {
  form: document.querySelector("#searchForm"),
  input: document.querySelector("#cityInput"),
  message: document.querySelector("#formMessage"),
  welcome: document.querySelector("#welcomeState"),
  loading: document.querySelector("#loadingState"),
  card: document.querySelector("#weatherCard"),
  unitToggle: document.querySelector("#unitToggle"),
  city: document.querySelector("#cityName"),
  date: document.querySelector("#weatherDate"),
  description: document.querySelector("#weatherDescription"),
  icon: document.querySelector("#weatherIcon"),
  temperature: document.querySelector("#temperature"),
  unitSymbol: document.querySelector("#unitSymbol"),
  feelsLike: document.querySelector("#feelsLike"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  pressure: document.querySelector("#pressure"),
  visibility: document.querySelector("#visibility"),
};

let units = "metric";
let lastCity = "";

function setMessage(text, isError = false) {
  elements.message.textContent = text;
  elements.message.classList.toggle("error", isError);
}

function setLoading(isLoading) {
  elements.loading.hidden = !isLoading;
  elements.welcome.hidden = isLoading || !elements.card.hidden;
}

function formatDate(timezoneOffset) {
  const date = new Date(Date.now() + timezoneOffset * 1000);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function renderWeather(data) {
  const weather = data.weather[0];
  const temperature = Math.round(data.main.temp);

  const unit = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "km/h" : "mph";
  const windSpeed =
    units === "metric" ? data.wind.speed * 3.6 : data.wind.speed;

  elements.city.textContent = `${data.name}, ${data.sys.country}`;
  elements.date.textContent = formatDate(data.timezone);
  elements.description.textContent = weather.description;

  elements.icon.src = `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;
  elements.icon.alt = weather.description;

  elements.temperature.textContent = temperature;
  elements.unitSymbol.textContent = unit;
  elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}${unit}`;

  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.wind.textContent = `${windSpeed.toFixed(1)} ${windUnit}`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;
  elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

  elements.card.hidden = false;
  elements.welcome.hidden = true;
}

async function getWeather(city) {
  if (!API_KEY || API_KEY.includes("PASTE_YOUR")) {
    setMessage(
      "Add your OpenWeatherMap API key in script.js before searching.",
      true
    );
    return;
  }

  setLoading(true);
  setMessage("", false);

  try {
    const url = `${API_URL}?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=${units}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to find that city.");
    }

    lastCity = city;
    renderWeather(data);
    setMessage(`Showing live weather for ${data.name}.`);
  } catch (error) {
    elements.card.hidden = true;
    elements.welcome.hidden = false;

    setMessage(
      error.message === "city not found"
        ? "We could not find that city. Please try again."
        : error.message,
      true
    );
  } finally {
    elements.loading.hidden = true;
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = elements.input.value.trim();

  if (!city) {
    setMessage("Please enter a city name to continue.", true);
    elements.input.focus();
    return;
  }

  getWeather(city);
});

elements.unitToggle.addEventListener("click", () => {
  units = units === "metric" ? "imperial" : "metric";

  const [celsius, fahrenheit] =
    elements.unitToggle.querySelectorAll("span");

  celsius.classList.toggle("active", units === "metric");
  fahrenheit.classList.toggle("active", units === "imperial");

  if (lastCity) {
    getWeather(lastCity);
  }
});