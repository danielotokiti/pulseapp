document.getElementById('ttc-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const route = document.getElementById('route').value.trim();
  const stopId = document.getElementById('stopId').value.trim();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = 'Loading...';

  const apiUrl = `https://retro.umoiq.com/service/publicXMLFeed?command=predictions&a=ttc&routeTag=${route}&stopId=${stopId}`;

  fetch(apiUrl)
    .then(response => response.text())
    .then(str => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(str, "application/xml");
      const predictions = xml.getElementsByTagName("prediction");

      if (predictions.length === 0) {
        resultsDiv.innerHTML = "<p>No upcoming vehicles found. Please check your route and stop ID.</p>";
        return;
      }

      const times = Array.from(predictions).map(p =>
        `${p.getAttribute("minutes")} min`
      );

      resultsDiv.innerHTML = `
        <p><strong>Next arrivals:</strong> ${times.join(", ")}</p>
      `;
    })
    .catch(() => {
      resultsDiv.innerHTML = "<p>Error fetching TTC data. Try again later.</p>";
    });
});
