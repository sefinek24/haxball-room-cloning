const targetLat = 52.232544, targetLon = 20.997543; // PL
const maxOffset = 4; // Maximum random offset for both coordinates

const randomWithinRange = (min, max) => Math.random() * (max - min) + min;

module.exports = () => {
	const latOffset = randomWithinRange(-maxOffset, maxOffset);
	const lonOffset = randomWithinRange(-maxOffset, maxOffset);

	const lat = (targetLat + latOffset).toFixed(6);
	const lon = (targetLon + lonOffset).toFixed(6);

	return [parseFloat(lat), parseFloat(lon)];
};