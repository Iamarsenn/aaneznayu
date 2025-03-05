// Initialize the map
const map = L.map('map').setView([41.8781, -87.6298], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Variables to store origin and destination coordinates
let originCoords = null;
let destinationCoords = null;

// Function to reverse-geocode coordinates into an address
async function getAddressFromCoordinates(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        return data.display_name || "Address not found";
    } catch (error) {
        console.error("Error fetching address:", error);
        return "Address not found";
    }
}

// Function to handle map clicks
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    if (!originCoords) {
        // Set origin
        originCoords = [lat, lng];
        const originAddress = await getAddressFromCoordinates(lat, lng);
        document.getElementById("location").value = originAddress;
    } else if (!destinationCoords) {
        // Set destination
        destinationCoords = [lat, lng];
        const destinationAddress = await getAddressFromCoordinates(lat, lng);
        document.getElementById("destination").value = destinationAddress;

        // Calculate distance and time
        calculateTimeAndDistance();
    } else {
        // Reset if both origin and destination are already set
        originCoords = [lat, lng];
        const originAddress = await getAddressFromCoordinates(lat, lng);
        document.getElementById("location").value = originAddress;
        destinationCoords = null;
        document.getElementById("destination").value = "";
        document.getElementById("distance-time").innerHTML = "";
        document.getElementById("submit-btn").disabled = true;
    }

    // Update the map with markers
    updateMap();
});

// Function to update the map with markers
function updateMap() {
    // Clear existing markers and layers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Add markers for origin and destination
    if (originCoords) {
        L.marker([originCoords[0], originCoords[1]]).addTo(map)
            .bindPopup("Origin: " + document.getElementById("location").value)
            .openPopup();
    }
    if (destinationCoords) {
        L.marker([destinationCoords[0], destinationCoords[1]]).addTo(map)
            .bindPopup("Destination: " + document.getElementById("destination").value)
            .openPopup();
    }

    // Add a polyline to connect the two points
    if (originCoords && destinationCoords) {
        L.polyline([
            [originCoords[0], originCoords[1]],
            [destinationCoords[0], destinationCoords[1]]
        ], { color: 'blue' }).addTo(map);

        // Fit the map to show both markers
        const bounds = L.latLngBounds([originCoords[0], originCoords[1]], [destinationCoords[0], destinationCoords[1]]);
        map.fitBounds(bounds);
    }
}

// Function to calculate distance and time
async function calculateTimeAndDistance() {
    const output = document.getElementById("distance-time");
    const submitButton = document.getElementById("submit-btn");

    if (!originCoords || !destinationCoords) {
        output.innerHTML = "<span style='color: red;'>Please select both origin and destination on the map.</span>";
        submitButton.disabled = true;
        return;
    }

    // Calculate distance using Haversine formula
    const distanceKm = haversineDistance(
        originCoords[0], originCoords[1], // Origin latitude and longitude
        destinationCoords[0], destinationCoords[1] // Destination latitude and longitude
    );

    // Estimate travel time
    const timeMinutes = estimateTravelTime(distanceKm);

    // Display results
    output.innerHTML = `
        <strong>Estimated Distance:</strong> ${distanceKm.toFixed(1)} km <br>
        <strong>Estimated Time:</strong> ${timeMinutes} mins
    `;

    submitButton.disabled = false; // Enable submission
}

// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Estimate travel time based on distance and average speed
function estimateTravelTime(distanceKm, averageSpeedKmh = 50) {
    const timeHours = distanceKm / averageSpeedKmh;
    const timeMinutes = timeHours * 60;
    return Math.ceil(timeMinutes); // Round up to the nearest minute
}

// Function to generate time options for the pickup time dropdown
function generateTimeOptions() {
    const pickupTimeSelect = document.getElementById('pickup-time');
    pickupTimeSelect.innerHTML = '<option value="" disabled selected>Select a time</option>'; // Reset options

    let startTime = new Date();
    startTime.setHours(0, 0, 0, 0); // Start at midnight

    for (let i = 0; i < 96; i++) { // 96 intervals of 15 min in 24 hours
        const timeString = startTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const option = document.createElement('option');
        option.value = timeString;
        option.textContent = timeString;
        pickupTimeSelect.appendChild(option);

        startTime.setMinutes(startTime.getMinutes() + 15); // Increment by 15 minutes
    }
}

// Event listener for the calculate button
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        map.invalidateSize(); // Force Leaflet to recalculate size
    }, 500);
});
