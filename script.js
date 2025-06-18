document.getElementById('ttc-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const route = document.getElementById('route').value.trim();
  const stop = document.getElementById('stop').value.trim();
  const resultsDiv = document.getElementById('results');
  
  // Input validation
  if (!route || !stop) {
    resultsDiv.innerHTML = '<p class="error">Please enter both route and stop numbers.</p>';
    return;
  }

  resultsDiv.innerHTML = '<p class="loading">Loading real-time data...</p>';
  
  try {
    const predictions = await fetchTTCPredictions(route, stop);
    displayResults(predictions, route, stop, resultsDiv);
  } catch (error) {
    console.error('API Error:', error);
    resultsDiv.innerHTML = `<p class="error">${error.message}</p>`;
  }
});

// Cache system (stores data for 30 seconds)
const predictionCache = {};
const CACHE_DURATION = 30000; // 30 seconds

async function fetchTTCPredictions(route, stop) {
  const cacheKey = `${route}-${stop}`;
  const now = Date.now();
  
  // Return cached data if available and fresh
  if (predictionCache[cacheKey] && (now - predictionCache[cacheKey].timestamp < CACHE_DURATION)) {
    return predictionCache[cacheKey].data;
  }

  const response = await fetch(
    `https://retro.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=${route}&s=${stop}`
  );
  
  if (!response.ok) throw new Error('Network response failed');
  
  const data = await response.json();
  
  // Handle API errors
  if (data.Error) {
    throw new Error(data.Error.content || 'Invalid route/stop combination');
  }

  // Cache the successful response
  predictionCache[cacheKey] = {
    data: data,
    timestamp: now
  };
  
  return data;
}

function displayResults(data, route, stop, element) {
  if (!data.predictions || !data.predictions.direction) {
    element.innerHTML = `
      <p class="no-results">
        No upcoming vehicles found for route <strong>${route}</strong> 
        at stop <strong>${stop}</strong>.
      </p>
    `;
    return;
  }

  const predictions = data.predictions.direction.prediction;
  const times = predictions.map(p => `${p.minutes} min`).join(', ');
  
  element.innerHTML = `
    <p class="success">
      Next <strong>${route}</strong> arrivals at stop <strong>${stop}</strong>:<br>
      ${times}
    </p>
    <p class="cache-note">(Updates every 30 seconds)</p>
  `;
}