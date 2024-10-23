document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector(".UserInput");
  const searchBtn = document.querySelector(".search");
  const CurrentDateAndTime = document.querySelector(".date");
  const CurrentTemp = document.querySelector(".Detail");
  const Humidity = document.querySelector(".humidity");
  const Wind = document.querySelector(".wind");
  const WeatherDescription = document.querySelector(".description");
  const Image = document.querySelector(".sideImg");

  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
  let Text = "";
  let lat = "";
  let lon = "";
  let currentUnit = "C";

  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[now.getDay()];
  const hour = now.getHours();
  const min = now.getMinutes();
  CurrentDateAndTime.textContent = `${day}, ${hour}:${
    min < 10 ? "0" : ""
  }${min}`;

  async function fetchData() {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${Text}&appid=338270f497082b116cec5dbdd9baf66f`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      lat = data.coord.lat;
      lon = data.coord.lon;
      displayCurrentWeather(data);
      fetchForecastData();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  function displayCurrentWeather(data) {
    updateTemperature(data.main.temp, CurrentTemp);
    Humidity.textContent = `Humidity - ${data.main.humidity} %`;
    Wind.textContent = `Wind - ${data.wind.speed} m/s`;
    WeatherDescription.textContent = `${data.weather[0].description}`;
    Image.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  }

  searchBtn.addEventListener("click", () => {
    Text = input.value;
    fetchData();
  });

  function updateTemperature(tempKelvin, element) {
    const tempCelsius = (tempKelvin - 273.15).toFixed(1);
    const tempFahrenheit = ((tempCelsius * 9) / 5 + 32).toFixed(1);

    if (currentUnit === "C") {
      element.textContent = `${tempCelsius} °C`;
    } else {
      element.textContent = `${tempFahrenheit} °F`;
    }
  }

  const forecastTableBody = document.querySelector(".forecast-data");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  let forecastData = [];
  let currentPage = 1;
  const entriesPerPage = 10;

  async function fetchForecastData() {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=338270f497082b116cec5dbdd9baf66f`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      forecastData = data.list;
      displayForecast(currentPage);
    } catch (error) {
      console.error("There was a problem fetching the forecast data:", error);
    }
  }

  function displayForecast(page) {
    forecastTableBody.innerHTML = "";
    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const slicedData = forecastData.slice(startIndex, endIndex);

    slicedData.forEach((entry) => {
      const date = new Date(entry.dt_txt).toLocaleString();
      const tempCelsius = (entry.main.temp - 273.15).toFixed(1);
      const weather = entry.weather[0].description;

      const row = document.createElement("tr");
      row.innerHTML = `
                <td class="border border-gray-300 px-4 py-2">${date}</td>
                <td class="border border-gray-300 px-4 py-2">${tempCelsius} °C</td>
                <td class="border border-gray-300 px-4 py-2">${weather}</td>
            `;
      forecastTableBody.appendChild(row);
    });
  }

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayForecast(currentPage);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage * entriesPerPage < forecastData.length) {
      currentPage++;
      displayForecast(currentPage);
    }
  });

  document.getElementById("send-btn").addEventListener("click", function () {
    const userInput = document.getElementById("user-input").value;
    document.getElementById("user-input").value = "";
    const chatbox = document.getElementById("chatbox");

    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.textContent = "You: " + userInput;
    chatbox.appendChild(userMessage);

    handleUserQuery(userInput);
  });

  async function handleUserQuery(query) {
    const chatbox = document.getElementById("chatbox");
    let botMessageText = "";

    if (isWeatherRelated(query)) {
      botMessageText = await fetchAIResponse(query);
    } else {
      botMessageText = "Sorry, I can only handle weather-related queries.";
    }

    const botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    botMessage.textContent = "Bot: " + botMessageText;
    chatbox.appendChild(botMessage);

    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function isWeatherRelated(query) {
    const weatherKeywords = [
      "weather",
      "rain",
      "sun",
      "temperature",
      "forecast",
      "cloud",
      "storm",
    ];
    return weatherKeywords.some((keyword) =>
      query.toLowerCase().includes(keyword)
    );
  }

  async function fetchAIResponse(query) {
    const apiKey = "AIzaSyDz1ob_NFkYbDh7LvOTOl-sPX1LjTZtzUA";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: query,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `Error ${response.status}: ${errorDetails.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      let BotResponse = data.candidates[0].content.parts[0].text;
      return BotResponse;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      return "Sorry, I couldn't retrieve the AI response at the moment.";
    }
  }
  function sortTempsAscending() {
    forecastData.sort((a, b) => a.main.temp - b.main.temp);
    displayForecast(currentPage);
  }

  function sortTempsDescending() {
    forecastData.sort((a, b) => b.main.temp - a.main.temp);
    displayForecast(currentPage);
  }

  function filterRainyDays() {
    const rainyDays = forecastData.filter((entry) =>
      entry.weather[0].description.toLowerCase().includes("rain")
    );
    displayFilteredForecast(rainyDays);
  }

  function findHighestTempDay() {
    const highestTempDay = forecastData.reduce(
      (max, entry) => (entry.main.temp > max.main.temp ? entry : max),
      forecastData[0]
    );
    displayFilteredForecast([highestTempDay]);
  }

  function displayFilteredForecast(filteredData) {
    forecastTableBody.innerHTML = "";
    filteredData.forEach((entry) => {
      const date = new Date(entry.dt_txt).toLocaleString();
      const tempCelsius = (entry.main.temp - 273.15).toFixed(1);
      const weather = entry.weather[0].description;

      const row = document.createElement("tr");
      row.innerHTML = `
            <td class="border border-gray-300 px-4 py-2">${date}</td>
            <td class="border border-gray-300 px-4 py-2">${tempCelsius} °C</td>
            <td class="border border-gray-300 px-4 py-2">${weather}</td>
        `;
      forecastTableBody.appendChild(row);
    });
  }

  document
    .querySelector(".sort-asc")
    .addEventListener("click", sortTempsAscending);
  document
    .querySelector(".sort-desc")
    .addEventListener("click", sortTempsDescending);
  document
    .querySelector(".filter-rain")
    .addEventListener("click", filterRainyDays);
  document
    .querySelector(".highest-temp")
    .addEventListener("click", findHighestTempDay);
});
