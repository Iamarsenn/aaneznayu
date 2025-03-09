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
