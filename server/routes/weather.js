const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");
const axios = require("axios");
require("dotenv").config();

// GET WEATHER
router.get("/", auth, async (req, res) => {
  const { city } = req.query;

  if (!city)
    return res.status(400).json({ message: "City is required" });

  try {
    // Call OpenWeather API from backend (API key hidden!)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: "metric", // Celsius
        },
      }
    );

    const weatherData = response.data;

    const result = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
    };

    // Save search to database
    db.query(
      "INSERT INTO searches (user_id, city, country, temperature, condition_text) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, result.city, result.country, result.temperature, result.condition],
      (err) => {
        if (err) console.error("Error saving search:", err.message);
      }
    );

    res.json(result);

  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "City not found!" });
    }
    res.status(500).json({ message: "Error fetching weather data" });
  }
});

// GET SEARCH HISTORY
router.get("/history", auth, (req, res) => {
  db.query(
    "SELECT * FROM searches WHERE user_id = ? ORDER BY searched_at DESC LIMIT 10",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// DELETE HISTORY
router.delete("/history/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM searches WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "History deleted" });
    }
  );
});

module.exports = router;