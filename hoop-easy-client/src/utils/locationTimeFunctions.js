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

function convertToLocalTimeWithOptions(storedUtcDateTime, options = {}) {
    try {
        const userLocalDateTime = new Date(storedUtcDateTime);

        if (isNaN(userLocalDateTime)) {
            throw new Error("Invalid date");
        }

        const userTimeZone = options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const dateFormat = options.dateFormat || { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeFormat = options.timeFormat || { hour: 'numeric', minute: 'numeric', second: 'numeric' };

        const userDateTimeString = userLocalDateTime.toLocaleString('en-US', {
            timeZone: userTimeZone,
            ...dateFormat,
            ...timeFormat,
        });

        return userDateTimeString;
    } catch (error) {
        console.error("Error converting to local time:", error.message);
        return null;
    }
}

function localToUTC( localDateTimeString ) {
    const dateObj = new Date(localDateTimeString);
    const year = dateObj.getUTCFullYear();
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const seconds = dateObj.getUTCSeconds().toString().padStart(2, '0');
    const formattedUtcDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    return formattedUtcDate
}

export { getDistanceFromLatLonInMiles, convertToLocalTime, convertToLocalTimeWithOptions, localToUTC }