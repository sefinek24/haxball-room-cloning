require('dotenv').config();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const proxyChain = require('proxy-chain');
const path = require('node:path');
const randomUserAgent = require('./scripts/randomUserAgent.js');
const getRandomGeoLocation = require('./scripts/getRandomGeoLocation.js');
const browserArgs = require('./scripts/args.js');
const loadProxies = require('./scripts/loadProxies.js');
const injectScript = require('./scripts/injectScript.js');
const getRoomData = require('./scripts/services/getRoomData.js');
const getToken = require('./scripts/services/getToken.js');

puppeteer.use(StealthPlugin());

const TARGET_ROOM_END = process.env.TARGET_ROOM_END;
let proxyIndex = 0;

const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

const injectRoomScript = async (page, cfg) => {
	cfg.ignoreGeo = TARGET_ROOM_END <= cfg.index;
	await injectScript(page, { ...cfg });

	page.on('load', async () => {
		console.log(`[${cfg.index}.${cfg.browserId}] Re-injecting room.js for ${cfg.roomName}`);

		const roomData = await getRoomData();
		if (cfg.index < TARGET_ROOM_END) {
			cfg.country = roomData.country;
			cfg.lat = roomData.lat;
			cfg.lon = roomData.lon;
		}

		setTimeout(async () => {
			try {
				await injectScript(page, { ...cfg });
			} catch (err) {
				console.error(`[${cfg.index}.${cfg.browserId}]`, err);
			}
		}, 1000);
	});
};

const launchBrowserWithTwoTabs = async (roomConfigs, proxies, stats) => {
	const browserId = stats.browsers + 1;
	const proxy = proxies[proxyIndex];
	if (!proxy) throw new Error(`Missing proxies, received ${proxy}`);

	proxyIndex = (proxyIndex + 1) % proxies.length;

	const newProxyUrl = await proxyChain.anonymizeProxy(proxy);
	const browser = await puppeteer.launch({
		headless: process.env.NODE_ENV === 'production',
		userDataDir: path.resolve(__dirname, 'chrome', 'profiles', 'spam', roomConfigs[0].index.toString()),
		args: [`--proxy-server=${newProxyUrl}`, ...browserArgs]
	});

	stats.browsers++;
	stats.tabs += roomConfigs.length;

	const userAgent = randomUserAgent();
	const pages = await browser.pages();
	let firstPageUsed = false;

	try {
		await Promise.all(roomConfigs.map(async cfg => {
			let page;
			if (!firstPageUsed) {
				page = pages[0];
				firstPageUsed = true;
			} else {
				page = await browser.newPage();
			}

			page.on('console', msg => {
				const text = msg.text();
				if (msg.type() === 'error') console.error(`[${cfg.index}.${browserId}]`, text);
				else if (msg.type() === 'warning') console.warn(`[${cfg.index}.${browserId}]`, text);
				else console.log(`[${cfg.index}.${browserId}]`, text);
			});

			await page.setUserAgent(userAgent.toString());

			cfg.browserId = browserId;

			console.log(`[${cfg.index}.${browserId}] Launching "${cfg.roomName}" [${cfg.country?.toUpperCase()}]; Token: "${cfg.token}"; ${userAgent}`);
			await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle0' });

			await injectRoomScript(page, cfg);

			stats.tokensUsed[cfg.token] = (stats.tokensUsed[cfg.token] || 0) + 1;
		}));
	} catch (err) {
		console.error(`[-.${browserId}]`, err);
	}
};

(async () => {
	const proxies = await loadProxies('proxies.txt');
	const roomNames = [];
	const stats = { browsers: 0, tabs: 0, tokensUsed: {} };

	for (let i = 1; i <= process.env.NUMBER_OF_ROOMS; i++) {
		if (process.env[`ROOM_NAME_${i}`]) roomNames.push(process.env[`ROOM_NAME_${i}`]);
	}

	const roomConfigs = [];
	const roomData = await getRoomData();
	let geoPair = null;

	for (let i = 1; i <= process.env.NUMBER_OF_ROOMS; i++) {
		const token = await getToken(i);
		const roomName = process.env[`ROOM_NAME_${i}`] || getRandomElement(roomNames);
		let country, lat, lon;

		if (i < TARGET_ROOM_END) {
			country = roomData.country ;
			lat = roomData.lat;
			lon = roomData.lon;
		} else if (!geoPair) {
			[country, [lat, lon]] = [roomData.country, getRandomGeoLocation()];
			geoPair = { country, lat, lon };
		} else {
			({ country, lat, lon } = geoPair);
			geoPair = null;
		}

		roomConfigs.push({ index: i, token, roomName, country, lat, lon });

		if (roomConfigs.length === 2) {
			console.log(`\n[-.${stats.browsers + 1}] Preparing to launch browser for the rooms: ${roomConfigs.map(config => config.index).join(', ')} (${lon}, ${lat})`);
			await launchBrowserWithTwoTabs(roomConfigs, proxies, stats);
			roomConfigs.length = 0;
		}
	}

	console.log('\nAll rooms have been processed!\n--- Summary ---');
	console.log(`Total browsers launched: ${stats.browsers}`);
	console.log(`Total tabs with rooms: ${stats.tabs}`);
	console.log(`Total unique tokens used: ${Object.keys(stats.tokensUsed).length}`);
	console.log('Token usage breakdown:');
	for (const [token, count] of Object.entries(stats.tokensUsed)) {
		console.log(`${token} was used in ${count} room(s)`);
	}
})();