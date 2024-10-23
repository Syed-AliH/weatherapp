
 window.onload = function() {
    const button = document.querySelector(".search");
    if (button) {
      button.click();  
    } else {
      console.log("Button not found.");
    }
  };
  
document.addEventListener("DOMContentLoaded", function () {
  const input = document.querySelector(".UserInput");
  const searchBtn = document.querySelector(".search");
  const cardContainer = document.querySelector(".card-container");
  const CurrentDateAndTime = document.querySelector(".date");
  const CurrentTemp = document.querySelector(".Detail");
  const Humidity = document.querySelector(".humidity");
  const Wind = document.querySelector(".wind");
  const WeatherDescription = document.querySelector(".description");
  const Image = document.querySelector(".sideImg");
  const City = document.querySelector(".city");
  const Celcius = document.querySelector(".Celcius");
  const Farenheit = document.querySelector(".Farenheit");

  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  let Text = "";
  let lat = "";
  let lon = "";
  let currentUnit = "C";
  let barChartInstance = null;
  let doughnutChartInstance = null;
  let lineChartInstance = null;

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
  if (min < 10) {
    CurrentDateAndTime.textContent = `${day}, ${hour}:0${min}`;
  } else {
    CurrentDateAndTime.textContent = `${day}, ${hour}:${min}`;
  }
 function showSpinner() {
  spinner.classList.remove("hidden");
}

function hideSpinner() {
  spinner.classList.add("hidden");
}
async function fetchData() {
  try {
    showSpinner();  
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
    await fetchData2();  
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    displayCityNotFound();
  } finally {
    hideSpinner();  
  }
}

  function displayCityNotFound() {
    cardContainer.innerHTML = "";
  
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "City not found. Please try again.";
    errorDiv.style.color = "red";
    errorDiv.style.fontSize = "1.5rem";
    errorDiv.style.textAlign = "center";
    errorDiv.style.marginTop = "20px";
  
    cardContainer.appendChild(errorDiv);
  }
  

  function displayCurrentWeather(data) {
    City.textContent = `${Text}'s Forecast`;
    updateTemperature(data.main.temp, CurrentTemp);
    Humidity.textContent = `Humidity - ${data.main.humidity} %`;
    Wind.textContent = `Wind - ${data.wind.speed} m/s`;
    WeatherDescription.textContent = `${data.weather[0].description}`;
    Image.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  }

  async function fetchData2() {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=338270f497082b116cec5dbdd9baf66f`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data2 = await response.json();

      const forecastData = data2.list.map((item) => ({
        date: new Date(item.dt * 1000),
        temp: item.main.temp,
        weather: item.weather[0].main,
        icon: item.weather[0].icon,
      }));

      displayForecast(forecastData);
      createCharts(forecastData);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  function displayForecast(forecastData) {
    cardContainer.innerHTML = "";
    const uniqueDays = {};
    let dayCount = 0;

    forecastData.forEach((item) => {
      const dateKey = getDateWithoutTime(item.date.toISOString());
      if (!uniqueDays[dateKey] && dayCount < 5) {
        const day = item.date.toLocaleDateString("en-US", { weekday: "long" });
        const formattedDate = item.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const Temp = item.temp;
        const weatherIcon = `http://openweathermap.org/img/wn/${item.icon}@2x.png`;

        const card = document.createElement("div");
        card.className =
          "relative bg-gray-100 card w-[15vw] h-[25vw] lg:w-[10vw] lg:h-[12vw] lg:bg-white rounded-xl mt-4 lg:mt-6 px-2 py-4";
        card.innerHTML = `
                    <div class="grid grid-rows-3 grid-cols-1 place-items-center h-full">
                        <div class="text-sm"><h1>${day}, ${formattedDate}</h1></div>
                        <img src="${weatherIcon}" alt="Weather icon" class="w-10 h-10">
                        <div class="text-sm flex gap-2">
                            <div class="max">${convertTemperature(
                              Temp
                            )}°${currentUnit}</div>
                        </div>
                    </div>
                `;
        cardContainer.appendChild(card);
        uniqueDays[dateKey] = true;
        dayCount++;
      }
    });
  }

  function createCharts(forecastData) {
    const labels = [];
    const temperatures = [];
    const weatherConditions = {};

    const uniqueDays = {};
    let dayCount = 0;

    forecastData.forEach((item) => {
      const day = item.date.toLocaleDateString("en-US", { weekday: "short" });
      const dateKey = item.date.toISOString().split("T")[0];

      if (!uniqueDays[dateKey] && dayCount < 5) {
        labels.push(day);
        const tempCelsius = (item.temp - 273.15).toFixed(1);
        temperatures.push(tempCelsius);

        weatherConditions[item.weather] =
          (weatherConditions[item.weather] || 0) + 1;

        uniqueDays[dateKey] = true;
        dayCount++;
      }
    });

    if (barChartInstance) {
      barChartInstance.destroy();
    }
    if (doughnutChartInstance) {
      doughnutChartInstance.destroy();
    }
    if (lineChartInstance) {
      lineChartInstance.destroy();
    }

    barChartInstance = barChart(labels, temperatures);
    doughnutChartInstance = doughnutChart(weatherConditions);
    lineChartInstance = lineChart(labels, temperatures);
  }

  function barChart(labels, temperatures) {
    const barCtx = document.getElementById("barChart").getContext("2d");
    return new Chart(barCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatures,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function doughnutChart(weatherConditions) {
    const doughnutCtx = document
      .getElementById("doughnutChart")
      .getContext("2d");
    return new Chart(doughnutCtx, {
      type: "doughnut",
      data: {
        labels: Object.keys(weatherConditions),
        datasets: [
          {
            label: "Weather Conditions",
            data: Object.values(weatherConditions),
            backgroundColor: [
              "rgba(255, 205, 86, 0.8)",
              "rgba(201, 203, 207, 0.8)",
              "rgba(54, 162, 235, 0.8)",
            ],
            borderColor: [
              "rgba(255, 205, 86, 1)",
              "rgba(201, 203, 207, 1)",
              "rgba(54, 162, 235, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          duration: 2000,
        },
      },
    });
  }

  function lineChart(labels, temperatures) {
    const lineCtx = document.getElementById("lineChart").getContext("2d");
    return new Chart(lineCtx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatures,
            fill: false,
            borderColor: "rgba(153, 102, 255, 1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: {
          easing: "easeOutBounce",
          duration: 2000,
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function getDateWithoutTime(dateString) {
    return new Date(dateString).toISOString().split("T")[0];
  }

  function updateTemperature(tempKelvin, element) {
    const tempCelsius = (tempKelvin - 273.15).toFixed(1);
    const tempFahrenheit = ((tempCelsius * 9) / 5 + 32).toFixed(1);

    if (currentUnit === "C") {
      element.textContent = `${tempCelsius} °C`;
    } else {
      element.textContent = `${tempFahrenheit} °F`;
    }
  }

  function convertTemperature(tempKelvin) {
    if (currentUnit === "C") {
      return (tempKelvin - 273.15).toFixed(1);
    } else {
      return (((tempKelvin - 273.15) * 9) / 5 + 32).toFixed(1);
    }
  }

  searchBtn.addEventListener("click", () => {
    Text = input.value;
    fetchData();
  });

  Celcius.addEventListener("click", () => {
    Celcius.style.backgroundColor = "black";
    Celcius.style.color = "white";
    Farenheit.style.backgroundColor = "#EEEEEE";
    Farenheit.style.color = "black";
    currentUnit = "C";
    fetchData();
  });

  Farenheit.addEventListener("click", () => {
    Celcius.style.backgroundColor = "#EEEEEE";
    Celcius.style.color = "black";
    Farenheit.style.backgroundColor = "black";
    Farenheit.style.color = "white";
    currentUnit = "F";
    fetchData();
  });
});
