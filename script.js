// Initialize the map
const map = L.map('map').setView([41.8781, -87.6298], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Recalculate map size on window resize
window.addEventListener('resize', function () {
    map.invalidateSize();
});

// Recalculate map size after the page loads (for mobile)
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        map.invalidateSize();
    }, 100); // Small delay to ensure the container is fully rendered
});

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

// Function to geocode an address into coordinates
async function getCoordinatesFromAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data.length > 0) {
            console.log("Geocoding result:", data[0]); // Debugging
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        } else {
            throw new Error("Address not found");
        }
    } catch (error) {
        console.error("Error geocoding address:", error);
        return null;
    }
}

// Function to set origin
async function setOrigin(lat, lng) {
    console.log("Setting origin:", lat, lng); // Debugging
    originCoords = [lat, lng];
    const originAddress = await getAddressFromCoordinates(lat, lng);
    document.getElementById("location").value = originAddress;
    updateMap();
}

// Function to set destination
async function setDestination(lat, lng) {
    console.log("Setting destination:", lat, lng); // Debugging
    destinationCoords = [lat, lng];
    const destinationAddress = await getAddressFromCoordinates(lat, lng);
    document.getElementById("destination").value = destinationAddress;
    updateMap();
    calculateTimeAndDistance();
}

// Function to handle map clicks
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;

    if (!originCoords) {
        await setOrigin(lat, lng);
    } else if (!destinationCoords) {
        await setDestination(lat, lng);
    } else {
        // Reset if both origin and destination are already set
        await setOrigin(lat, lng);
        destinationCoords = null;
        document.getElementById("destination").value = "";
        document.getElementById("distance-time").innerHTML = "";
        document.getElementById("submit-btn").disabled = true;
    }
});

// Function to update the map with markers
function updateMap() {
    console.log("Updating map..."); // Debugging

    // Clear existing markers and layers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Add markers for origin and destination
    if (originCoords) {
        console.log("Adding origin marker:", originCoords); // Debugging
        L.marker([originCoords[0], originCoords[1]]).addTo(map)
            .bindPopup("Origin: " + document.getElementById("location").value)
            .openPopup();
    }
    if (destinationCoords) {
        console.log("Adding destination marker:", destinationCoords); // Debugging
        L.marker([destinationCoords[0], destinationCoords[1]]).addTo(map)
            .bindPopup("Destination: " + document.getElementById("destination").value)
            .openPopup();
    }

    // Add a polyline to connect the two points
    if (originCoords && destinationCoords) {
        console.log("Adding polyline between origin and destination"); // Debugging
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

// Event listener for setting origin from address input
document.getElementById('set-origin-btn').addEventListener('click', async () => {
    console.log("Set Origin button clicked"); // Debugging
    const address = document.getElementById('location').value;
    if (address) {
        const coords = await getCoordinatesFromAddress(address);
        if (coords) {
            await setOrigin(coords.lat, coords.lon);
        } else {
            alert("Address not found. Please try again.");
        }
    }
});

// Event listener for setting destination from address input
document.getElementById('set-destination-btn').addEventListener('click', async () => {
    console.log("Set Destination button clicked"); // Debugging
    const address = document.getElementById('destination').value;
    if (address) {
        const coords = await getCoordinatesFromAddress(address);
        if (coords) {
            await setDestination(coords.lat, coords.lon);
        } else {
            alert("Address not found. Please try again.");
        }
    }
});
function generateTimeOptions() {
    console.log("Generating time options..."); // Debugging line
    const pickupTimeSelect = document.getElementById('pickup-time');

    // Clear existing options (except the first one)
    pickupTimeSelect.innerHTML = '<option value="" disabled selected>Select a time</option>';

    // Start time (0:00 AM)
    let startTime = new Date();
    startTime.setHours(0, 0, 0, 0); // Set to midnight

    // Loop through 24 hours with 15-minute intervals
    for (let i = 0; i < 96; i++) { // 96 intervals of 15 minutes in 24 hours
        // Format the time as HH:MM AM/PM
        const timeString = startTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Create a new <option> element
        const option = document.createElement('option');
        option.value = timeString; // Set the value (e.g., "12:00 AM")
        option.textContent = timeString; // Set the display text (e.g., "12:00 AM")

        // Add the option to the <select> element
        pickupTimeSelect.appendChild(option);

        // Increment time by 15 minutes
        startTime.setMinutes(startTime.getMinutes() + 15);
    }
}

// Call the function to generate time options when the page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded, generating time options..."); // Debugging line
    generateTimeOptions();
});

// Add the "selected" attribute to the current time option
if (option.value === currentTime) {
    option.selected = true;
}
// Function to open the modal
function openModal(imageSrc, title, description) {
    const modal = document.getElementById('myModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');

    // Set the modal content
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    // Display the modal
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}

// Close the modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    const modal = document.getElementById('myModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
