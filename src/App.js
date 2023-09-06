import React, { useState, useEffect } from "react";
import "./App.css";
import { Icon } from "@iconify/react";

const api_key = "523960c39396ebd57a854ce18c8e3e6c";

const convertTimeStamp = (dt) => {
  const date = new Date(dt * 1000);
  return date.toLocaleDateString(); // Adjust the format as needed
};

function weatherData(data) {
  if (!data) return null;

  let daily_3h_data = data.list.map((day) => ({
    date: convertTimeStamp(day.dt),
    low: day.main.temp_min,
    high: day.main.temp_max,
    feel_like: day.main.feels_like,
    humidity: day.main.humidity,
    precipitation: day.pop,
    description: day.weather[0].description,
    icon_url: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
  }));

  let unique_dates_set = new Set();
  const daily_data = daily_3h_data.filter((item) => {
    if (!unique_dates_set.has(item.date)) {
      unique_dates_set.add(item.date);
      return true;
    }
    return false;
  });

  return daily_data;
}

function WeatherCards({ daily_data, unit }) {
  if (!daily_data) return null;
  let data = JSON.parse(daily_data); // parse the data from string to object
  return (
    <div className="weather-card-container">
      {data.map((item, index) => (
        <div className="weather-card" key={index}>
          <h3 className="date">{item.date}</h3>
          <h4 className="desc"> {item.description}</h4>
          <img src={item.icon_url} alt={item.description} />
          <p>
            <strong>Low:</strong> {item.low}{unit === "metric" ? "°C" : "°F"}
          </p>
          <p>
            <strong>High:</strong> {item.high}{unit === "metric" ? "°C" : "°F"}
          </p>
          <p>
            <strong>Feel Like:</strong> {item.feel_like}{unit === "metric" ? "°C" : "°F"}
          </p>
          <p>
            <strong>Humidity:</strong> {item.humidity}%
          </p>
          <p>
            <strong>Precipitation:</strong> {parseInt(item.precipitation * 100)}
            %
          </p>
        </div>
      ))}
    </div>
  );
}
function CityCard({ data }) {
  if (!data) return null;
  let city_data = JSON.parse(data); // parse the data from string to object
  return (
    <div className="city-info">
      <div className="city-name row">City: {city_data.name}</div>
      <div className="city-country row">Country: {city_data.country}</div>
      <div className="city-population row">Population: {city_data.population.toLocaleString()}</div>
    </div>
  );
}

function App() {
  const [searchInput, setSearchInput] = useState("new york");
  const [cityName, setCityName] = useState("new york");
  const [errorMessage, setErrorMessage] = useState("");
  const [outputData, setOutputData] = useState("");
  const [cityInfo, setCityInfo] = useState("");
  const [unit, setUnit] = useState("imperial");
  const [localTime, setLocalTime] = useState(new Date(Date.now()).toLocaleString());

  const handleSubmit = (e) => {
    e.preventDefault();
    setCityName(searchInput);
  };
  useEffect(() => {

    const timerID = setInterval(() => {
        setLocalTime(new Date(Date.now()).toLocaleString());
    }, 1000);

    return function cleanup() {
        clearInterval(timerID);
    };
});

  useEffect(() => {
    const fetchData = async () => {
      if (!cityName) return; // Don't fetch if cityName is an empty string

      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast/?q=${cityName}&appid=${api_key}&units=${unit}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === "404") {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("");
          setOutputData(JSON.stringify(weatherData(data))); // set the data as object, not stringified
          setCityInfo(JSON.stringify(data.city));
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchData();
  }, [cityName, unit]);
  return (
    <div className="body">
      <div className="time"> {localTime} </div>
      <div className="form">
      <form className="unit-form">
        <label><input 
          type="radio" 
          name="unit" 
          value="metric" 
          checked={unit=== "metric"} 
          onChange={()=>setUnit("metric")}/> Metric
          </label>
        <label><input 
        type="radio" 
        name="unit" 
        value="imperial" 
        checked={unit=== "imperial"}
        onChange = {()=>setUnit("imperial")}/> Imperial
        </label>
      </form>
      <form onSubmit={handleSubmit} className="city-form">

        <input
          type="text"
          placeholder="Enter city"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-box"
        />
        <button className="submit-btn">
          <Icon icon="fluent:send-20-regular" />
        </button>

      </form>
      
      </div>

      {!errorMessage ? (
        <>
          <CityCard data={cityInfo} />
          <WeatherCards daily_data={outputData} unit = {unit}/>
        </>
      ) : (
        <div className="error-message">{errorMessage}</div>
      )}
    </div>
  );
}

export default App;
