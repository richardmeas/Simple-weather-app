(function () {
  'use strict';

  // Get your free API key at https://openweathermap.org/api
  const API_KEY = localStorage.getItem('weather_api_key') || '';
  const BASE_URL = 'https://api.openweathermap.org';

  const STORAGE_FAVORITES = 'weather_favorites';
  const DEFAULT_CITY = 'London';

  const elements = {
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    citySearch: document.getElementById('citySearch'),
    searchBtn: document.getElementById('searchBtn'),
    addFavoriteBtn: document.getElementById('addFavoriteBtn'),
    currentPlaceholder: document.getElementById('currentPlaceholder'),
    currentContent: document.getElementById('currentContent'),
    currentCity: document.getElementById('currentCity'),
    isFavoriteBadge: document.getElementById('isFavoriteBadge'),
    currentTemp: document.getElementById('currentTemp'),
    currentIcon: document.getElementById('currentIcon'),
    currentDesc: document.getElementById('currentDesc'),
    currentHumidity: document.getElementById('currentHumidity'),
    currentFeelsLike: document.getElementById('currentFeelsLike'),
    currentWind: document.getElementById('currentWind'),
    forecastList: document.getElementById('forecastList'),
    forecastPlaceholder: document.getElementById('forecastPlaceholder'),
    favoritesList: document.getElementById('favoritesList'),
    favoritesPlaceholder: document.getElementById('favoritesPlaceholder'),
    apiLogList: document.getElementById('apiLogList'),
    apiLogPlaceholder: document.getElementById('apiLogPlaceholder'),
    clearLogBtn: document.getElementById('clearLogBtn'),
  };

  let lastSearchedCity = '';

  function getFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setFavorites(list) {
    localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(list));
    renderFavorites();
  }

  function addFavorite(name) {
    const fav = getFavorites();
    const normalized = name.trim();
    if (!normalized || fav.includes(normalized)) return;
    fav.push(normalized);
    setFavorites(fav);
  }

  function removeFavorite(name) {
    setFavorites(getFavorites().filter((c) => c !== name));
    if (lastSearchedCity === name) {
      elements.isFavoriteBadge.classList.add('hidden');
    }
  }

  function isFavorite(name) {
    return getFavorites().includes((name || lastSearchedCity).trim());
  }

  function logApiCall(method, url, status, extra) {
    const li = document.createElement('li');
    li.className = 'api-log-item ' + (status === 'error' ? 'error' : 'get');
    const time = new Date().toLocaleTimeString();
    li.innerHTML =
      '<span class="method">' +
      method +
      '</span><span class="url">' +
      escapeHtml(url) +
      '</span><div class="time">' +
      time +
      '</div>' +
      (extra ? '<div class="status ' + (status === 'error' ? 'err' : 'ok') + '">' + escapeHtml(extra) + '</div>' : '');
    elements.apiLogList.insertBefore(li, elements.apiLogList.firstChild);
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  async function fetchApi(endpoint, params = {}) {
    const p = new URLSearchParams({ ...params, appid: API_KEY });
    const url = BASE_URL + endpoint + '?' + p.toString();
    const fullUrl = BASE_URL + endpoint + '?' + p.toString().replace(API_KEY, '***');
    logApiCall('GET', fullUrl, 'pending', 'Loading…');

    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        logApiCall('GET', fullUrl, 'error', res.status + ' ' + (data.message || res.statusText));
        return null;
      }
      logApiCall('GET', fullUrl, 'ok', res.status + ' – ' + (data.name || data.city?.name || 'OK'));
      return data;
    } catch (err) {
      logApiCall('GET', fullUrl, 'error', err.message || 'Network error');
      return null;
    }
  }

  function showCurrent(data) {
    if (!data) return;
    lastSearchedCity = data.name;
    elements.currentPlaceholder.classList.add('hidden');
    elements.currentContent.classList.remove('hidden');
    elements.currentCity.textContent = data.name + (data.sys?.country ? ', ' + data.sys.country : '');
    elements.currentTemp.textContent = Math.round(data.main.temp);
    elements.currentFeelsLike.textContent = Math.round(data.main.feels_like) + '°C';
    elements.currentHumidity.textContent = data.main.humidity + '%';
    elements.currentWind.textContent = (data.wind?.speed ?? 0) + ' m/s';
    elements.currentDesc.textContent = data.weather?.[0]?.description ?? '';
    const icon = data.weather?.[0]?.icon;
    if (icon) {
      elements.currentIcon.src = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
      elements.currentIcon.alt = elements.currentDesc.textContent;
    }
    elements.isFavoriteBadge.classList.toggle('hidden', !isFavorite(data.name));
  }

  function showForecast(data) {
    if (!data?.list?.length) {
      elements.forecastPlaceholder.classList.remove('hidden');
      elements.forecastPlaceholder.textContent = 'No forecast data.';
      return;
    }
    elements.forecastPlaceholder.classList.add('hidden');
    const dayMap = new Map();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    for (const item of data.list) {
      const d = new Date(item.dt * 1000);
      const key = d.toDateString();
      if (!dayMap.has(key)) dayMap.set(key, { date: d, item });
    }
    const entries = Array.from(dayMap.entries()).slice(0, 5);
    elements.forecastList.innerHTML = '';
    entries.forEach(([_, { date, item }]) => {
      const li = document.createElement('li');
      li.className = 'forecast-item';
      const icon = item.weather?.[0]?.icon;
      const iconUrl = icon ? 'https://openweathermap.org/img/wn/' + icon + '@2x.png' : '';
      li.innerHTML =
        '<span class="day">' +
        escapeHtml(date.toLocaleDateString(undefined, options)) +
        '</span>' +
        '<img src="' +
        iconUrl +
        '" alt="" />' +
        '<span class="desc">' +
        escapeHtml(item.weather?.[0]?.description ?? '') +
        '</span>' +
        '<span class="temps">' +
        Math.round(item.main?.temp_min ?? 0) +
        '° / ' +
        Math.round(item.main?.temp_max ?? 0) +
        '°</span>';
      elements.forecastList.appendChild(li);
    });
  }

  function renderFavorites() {
    const fav = getFavorites();
    elements.favoritesList.innerHTML = '';
    fav.forEach((name) => {
      const li = document.createElement('li');
      li.className = 'favorite-item';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = name;
      nameSpan.addEventListener('click', () => {
        elements.citySearch.value = name;
        search();
      });
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Remove';
      btn.addEventListener('click', () => removeFavorite(name));
      li.appendChild(nameSpan);
      li.appendChild(btn);
      elements.favoritesList.appendChild(li);
    });
  }

  async function search() {
    const q = elements.citySearch.value.trim();
    if (!q) return;
    if (!API_KEY) {
      alert('Please set your OpenWeatherMap API key. Get one at https://openweathermap.org/api and save it (e.g. in the console: localStorage.setItem("weather_api_key", "YOUR_KEY"))');
      return;
    }

    const current = await fetchApi('/data/2.5/weather', { q, units: 'metric' });
    if (current) showCurrent(current);

    const coord = current?.coord;
    if (coord) {
      const forecast = await fetchApi('/data/2.5/forecast', {
        lat: coord.lat,
        lon: coord.lon,
        units: 'metric',
      });
      showForecast(forecast);
    } else {
      elements.forecastPlaceholder.classList.remove('hidden');
      elements.forecastPlaceholder.textContent = 'Search for a city to see forecast.';
      elements.forecastList.innerHTML = '';
    }
  }

  elements.searchBtn.addEventListener('click', search);
  elements.citySearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') search();
  });
  elements.addFavoriteBtn.addEventListener('click', () => {
    const name = (lastSearchedCity || elements.citySearch.value).trim();
    if (!name) {
      alert('Search for a city first, then add it to favorites.');
      return;
    }
    addFavorite(name);
    elements.isFavoriteBadge.classList.remove('hidden');
  });
  elements.clearLogBtn.addEventListener('click', () => {
    elements.apiLogList.innerHTML = '';
  });

  elements.saveApiKeyBtn.addEventListener('click', () => {
    const key = (elements.apiKeyInput && elements.apiKeyInput.value || '').trim();
    if (key) {
      localStorage.setItem('weather_api_key', key);
      alert('API key saved. You can search now.');
      if (typeof location !== 'undefined' && location.reload) location.reload();
    } else {
      alert('Enter your OpenWeatherMap API key.');
    }
  });

  if (API_KEY && elements.apiKeyInput) elements.apiKeyInput.placeholder = 'Saved (re-enter to change)';

  renderFavorites();

  if (API_KEY) {
    elements.citySearch.placeholder = 'Search city...';
    elements.citySearch.value = DEFAULT_CITY;
    search();
  } else {
    elements.currentPlaceholder.textContent = 'Set your API key to start. See README or console.';
  }
})();
