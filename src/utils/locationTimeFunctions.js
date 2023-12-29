function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    var dInMiles = d * 0.621371; // Convert to miles
    return dInMiles;
 }
 
 function deg2rad(deg) {
    return deg * (Math.PI/180)
 }

 function convertToLocalTime( storedUtcDateTime ) {
    const userLocalDateTime = new Date(storedUtcDateTime);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userDateTimeString = userLocalDateTime.toLocaleString('en-US', { timeZone: userTimeZone });
    return userDateTimeString
}

export { getDistanceFromLatLonInMiles, convertToLocalTime }