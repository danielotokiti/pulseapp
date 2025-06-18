async function getPredictions() {
  const route = document.getElementById('route').value.trim();
  const stop = document.getElementById('stop').value.trim();
  const resultsDiv = document.getElementById('results');

  if (!route || !stop) {
    resultsDiv.innerHTML = '<p>Please enter both route and stop ID.</p>';
    return;
  }

  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    const url = `https://retro.umoiq.com/service/publicJSONFeed?command=predictions&a=ttc&r=${route}&s=${stop}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.predictions?.direction?.length > 0) {
      const predictions = data.predictions.direction[0].prediction;
      let output = `<h3>Next Arrivals for Route ${route}</h3><ul>`;
      predictions.forEach(p => {
        output += `<li>In ${p.minutes} min (${p.seconds} seconds)</li>`;
      });
      output += '</ul>';
      resultsDiv.innerHTML = output;
    } else {
      resultsDiv.innerHTML = '<p>No upcoming vehicles found.</p>';
    }
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = '<p>Error fetching data. Please try again.</p>';
  }
}
