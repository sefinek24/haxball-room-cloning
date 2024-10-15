const fs = require('node:fs/promises');
const getToken = require('./services/getToken');

module.exports = async (page, cfg) => {
	const token = await getToken(cfg.index);

	let scriptContent = await fs.readFile('./haxball/room.js', 'utf8');
	scriptContent = scriptContent
		.replace(/\{NODE_ENV}/g, process.env.NODE_ENV)

		.replace(/'\{IGNORE_GEO}'/g, cfg.ignoreGeo || false)
		.replace(/\{COUNTRY}/g, cfg.country || 'RU')
		.replace(/'\{GEO_LAT}'/g, cfg.lat)
		.replace(/'\{GEO_LON}'/g, cfg.lon)

		.replace(/\{PASSWORD}/g, process.env.PASSWORD)
		.replace(/\{TOKEN}/g, token)
		.replace(/\{ROOM_NAME}/g, cfg.roomName)
		.replace(/\{ROOM_NAME_TO_CLONE}/g, process.env.ROOM_NAME_TO_CLONE)

		.replace(/'\{CAPTCHA}'/g, process.env.CAPTCHA === 'true' || !process.env.CAPTCHA);

	await page.evaluate((script, style) => {
		const scriptTag = document.createElement('script');
		scriptTag.textContent = script;
		document.body.appendChild(scriptTag);

		const styleTag = document.createElement('style');
		styleTag.textContent = style;
		document.head.appendChild(styleTag);
	}, scriptContent, 'body{background-color:#3c3c3c}');

	console.log(`[${cfg.index}.${cfg.browserId}] Script injected successfully`);
};
