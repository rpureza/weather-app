import { useState, useEffect } from "react";

const API = "http://localhost:3002";

export default function Dashboard({ token, email, onLogout }) {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/weather/history`, { headers });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setHistory(data);
    } catch {
      console.error("Could not load history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const searchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setError("");
    setLoading(true);
    setWeather(null);
    try {
      const res = await fetch(`${API}/weather?city=${city}`, { headers });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      setWeather(data);
      fetchHistory();
    } catch {
      setError("Could not fetch weather. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = async (id) => {
    await fetch(`${API}/weather/history/${id}`, {
      method: "DELETE",
      headers,
    });
    fetchHistory();
  };

  const searchFromHistory = (cityName) => {
    setCity(cityName);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-logo">WeatherApp</div>
          <div className="dash-user">{email}</div>
        </div>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>

      {/* Search */}
      <div className="search-section">
        <h3>🌤️ Search Weather</h3>
        {error && <div className="error-msg">{error}</div>}
        <form className="search-form" onSubmit={searchWeather}>
          <input
            type="text"
            placeholder="Enter city name... (e.g. Manila, Tokyo, London)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button className="btn-search" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Weather Result */}
      {weather && (
        <div className="weather-card">
          <div className="weather-city">{weather.city}</div>
          <div className="weather-country">{weather.country}</div>
          <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
          <div className="weather-condition">{weather.description}</div>
          <div className="weather-details">
            <div className="weather-detail">
              <div className="detail-label">Feels Like</div>
              <div className="detail-value">{Math.round(weather.feels_like)}°C</div>
            </div>
            <div className="weather-detail">
              <div className="detail-label">Humidity</div>
              <div className="detail-value">{weather.humidity}%</div>
            </div>
            <div className="weather-detail">
              <div className="detail-label">Condition</div>
              <div className="detail-value">{weather.condition}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search History */}
      <div className="history-section">
        <h3>🕐 Recent Searches</h3>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌍</div>
              <p>No searches yet. Search a city above!</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => searchFromHistory(item.city)}
              >
                <div>
                  <div className="history-city">{item.city}, {item.country}</div>
                  <div className="history-info">
                    {item.condition_text} • {new Date(item.searched_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="history-temp">{Math.round(item.temperature)}°C</div>
                  <button
                    className="btn-delete-history"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistory(item.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}