document.getElementById('ttc-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const route = document.getElementById('route').value.trim();
  const stop = document.getElementById('stop').value.trim();
  const resultsDiv = document.getElementById('results');

  resultsDiv.innerHTML = 'Loading...';

  const url = `https://www.transsee.ca/api/getNextBus?agency=ttc&route=${route}&stop=${stop}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const predictions = data?.nextbus?.[0]?.times;

      if (!predictions || predictions.length === 0) {
        resultsDiv.innerHTML = '<p>No upcoming vehicles found. Double-check the route and stop ID.</p>';
        return;
      }

      const formatted = predictions.map(min => `${min} min`).join(', ');
      resultsDiv.innerHTML = `<p><strong>Next ${route} arrivals at stop ${stop}:</strong> ${formatted}</p>`;
    })
    .catch(err => {
      console.error(err);
      resultsDiv.innerHTML = '<p>Error fetching data. Try again later.</p>';
    });
});
