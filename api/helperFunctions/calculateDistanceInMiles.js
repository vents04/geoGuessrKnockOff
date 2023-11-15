function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

module.exports = function checkCoordinatesWithinRadius(lat1, lon1, lat2, lon2) {
    const earthRadius = 3959; // Radius of the Earth in miles

    // Convert coordinates to radians
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Calculate the difference between the coordinates
    const latDiff = lat2Rad - lat1Rad;
    const lonDiff = lon2Rad - lon1Rad;

    // Calculate the central angle using the Haversine formula
    const a =
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance in miles
    const distance = earthRadius * c;

    // Check if the distance is within the specified radius
    return distance;
};
