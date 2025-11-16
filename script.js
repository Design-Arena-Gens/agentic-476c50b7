const routes = [
  {
    origin: "Central Station",
    destination: "Downtown",
    times: ["05:30", "06:15", "07:00", "08:30", "10:00", "12:15", "14:45", "17:30", "19:15", "21:00"],
  },
  {
    origin: "Central Station",
    destination: "Airport",
    times: ["06:00", "07:30", "09:00", "11:30", "13:45", "16:15", "18:00", "20:30", "22:45"],
  },
  {
    origin: "Downtown",
    destination: "Central Station",
    times: ["05:50", "06:40", "07:55", "09:10", "11:00", "13:20", "15:00", "17:45", "20:10", "22:00"],
  },
  {
    origin: "Downtown",
    destination: "Airport",
    times: ["06:25", "07:40", "09:20", "11:10", "12:55", "15:30", "18:05", "20:40"],
  },
  {
    origin: "Airport",
    destination: "Central Station",
    times: ["06:50", "08:30", "10:15", "12:00", "13:45", "16:05", "18:40", "21:10", "23:00"],
  },
  {
    origin: "Airport",
    destination: "Downtown",
    times: ["07:15", "08:45", "10:30", "12:40", "14:20", "16:55", "19:25", "21:30"],
  },
];

const originSelect = document.getElementById("origin");
const destinationSelect = document.getElementById("destination");
const form = document.getElementById("route-form");
const statusEl = document.getElementById("status");
const detailContainer = document.getElementById("details");
const departureTimeEl = document.getElementById("departure-time");
const departureDayEl = document.getElementById("departure-day");
const selectedRouteEl = document.getElementById("selected-route");

const routeMap = routes.reduce((acc, route) => {
  if (!acc[route.origin]) {
    acc[route.origin] = [];
  }
  acc[route.origin].push(route.destination);
  return acc;
}, {});

function ensureUnique(list) {
  return [...new Set(list)];
}

function populateOrigins() {
  const origins = ensureUnique(routes.map((route) => route.origin));
  originSelect.innerHTML = origins
    .map((origin) => `<option value="${origin}">${origin}</option>`)
    .join("");
}

function populateDestinations(origin) {
  const destinations = ensureUnique(routeMap[origin] || []);
  destinationSelect.innerHTML = destinations
    .map((destination) => `<option value="${destination}">${destination}</option>`)
    .join("");
}

function getRoute(origin, destination) {
  return routes.find((route) => route.origin === origin && route.destination === destination);
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeLabel(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function findNextDeparture(times) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const time of times) {
    if (timeToMinutes(time) >= nowMinutes) {
      return { time, dayOffset: 0 };
    }
  }

  return { time: times[0], dayOffset: 1 };
}

function formatDayLabel(offset) {
  const labelDate = new Date();
  labelDate.setDate(labelDate.getDate() + offset);
  const relative = offset === 0 ? "Today" : "Tomorrow";
  const weekday = labelDate.toLocaleDateString([], { weekday: "long" });
  return `${relative} (${weekday})`;
}

function showResult(route, result) {
  statusEl.textContent = "Next departure found:";
  detailContainer.classList.remove("hidden");
  departureTimeEl.textContent = formatTimeLabel(result.time);
  departureDayEl.textContent = formatDayLabel(result.dayOffset);
  selectedRouteEl.textContent = `${route.origin} → ${route.destination}`;
}

function showError(message) {
  statusEl.textContent = message;
  detailContainer.classList.add("hidden");
}

populateOrigins();
populateDestinations(originSelect.value);

originSelect.addEventListener("change", () => {
  populateDestinations(originSelect.value);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const origin = originSelect.value;
  const destination = destinationSelect.value;
  const route = getRoute(origin, destination);

  if (!route) {
    showError("No schedule found for this route.");
    return;
  }

  if (route.times.length === 0) {
    showError("This route has no departures scheduled.");
    return;
  }

  const nextDeparture = findNextDeparture(route.times);
  showResult(route, nextDeparture);
});
