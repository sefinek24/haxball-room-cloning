const axios = require('../../scripts/services/axios.js');

const name = process.env.ROOM_NAME_TO_CLONE;

module.exports = async () => {
	if (!name) throw new Error('ROOM_NAME_TO_CLONE is null or undefined');

	try {
		const res = await axios.get(`https://api.sefinek.net/api/v2/haxball/room-list?name=${name}`);
		if (!res.data) {
			console.warn('Missing res.data');
			return [];
		}

		return res.data.length > 0 ? res.data[0] : { country: 'pl', lat: 52.2296752929688, lon: 21.0122299194336 };
	} catch (err) {
		console.error(err);
		return [];
	}
};