require('dotenv').config();

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('node:fs');
const getRandomGeoLocation = require('./scripts/getRandomGeoLocation.js');
const browserArgs = require('./scripts/args.js');
const loadProxies = require('./scripts/loadProxies.js');
const injectScript = require('./scripts/injectScript.js');
const getRoomData = require('./scripts/services/getRoomData.js');
const getToken = require('./scripts/services/getToken.js');
const launchBrowser = require('./scripts/launchBrowser.js');
const { createProfileDir, getRandomNickname, setupRoom, openTargetRoom, waitForSelector } = require('./scripts/utils.js');
const { USERNAMES, MESSAGES } = require('./scripts/arrays.js');
const sleep = require('./scripts/sleep.js');

puppeteer.use(StealthPlugin());

const TARGET_ROOM_END = process.env.TARGET_ROOM_END;
let proxyIndex = 0;

const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

const injectRoomScript = async (page, cfg) => {
	cfg.ignoreGeo = TARGET_ROOM_END <= cfg.index;
	await injectScript(page, { ...cfg }, USERNAMES);

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
				await injectScript(page, { ...cfg }, USERNAMES);
			} catch (err) {
				console.error(`[${cfg.index}.${cfg.browserId}]`, err);
			}
		}, 1000);
	});
};

const launchBrowserWithTwoTabs = async (roomConfigs, proxies, stats) => {
	const browserId = ++stats.browsers;
	const proxy = proxies[proxyIndex];

	if (!proxy) throw new Error(`Missing proxies, received ${proxy}`);
	proxyIndex = (proxyIndex + 1) % proxies.length;

	const profile = createProfileDir();
	if (fs.existsSync(profile.path)) fs.rmSync(profile.path, { recursive: true, force: true });

	const browser = await launchBrowser(proxy, profile.path, browserArgs);
	stats.tabs += roomConfigs.length;

	const [initialPage] = await browser.pages();
	const roomUrls = [];
	let firstPageUsed = false;

	const handleConsoleMessage = async (msg, cfg) => {
		const text = msg.text();
		const logPrefix = `[${cfg.index}.${browserId}]`;

		switch (msg.type()) {
		case 'error':
			console.error(logPrefix, text);
			break;
		case 'warning':
			console.warn(logPrefix, text);
			break;
		default:
			console.log(logPrefix, text);
			if ((text.startsWith('Room started:') && stats.browsers <= 12) || process.env.BOTS === 'true') {
				const roomUrl = text.split('Room started: ')[1];
				roomUrls.push({ url: roomUrl, browser });
			}
		}
	};

	try {
		for (const cfg of roomConfigs) {
			const page = firstPageUsed ? await browser.newPage() : initialPage;
			firstPageUsed = true;

			page.on('console', msg => handleConsoleMessage(msg, cfg));

			cfg.browserId = browserId;
			await openTargetRoom(page, 'https://www.haxball.com/headless');
			await injectRoomScript(page, cfg);
			stats.tokensUsed[cfg.token] = (stats.tokensUsed[cfg.token] || 0) + 1;
		}

		if (stats.browsers >= parseInt(process.env.BOTS_PER_BROWSER) || process.env.BOTS !== 'true') return;
		await sleep(2000);

		const maxRuns = Math.floor(Math.random() * parseInt(process.env.MAX_BOTS)) + 1;
		console.log(maxRuns);
		for (let runCount = 0; runCount < maxRuns; runCount++) {
			const page = await roomUrls[0].browser.newPage();
			await openTargetRoom(page, roomUrls[0].url);
			await setupRoom(page, getRandomNickname(USERNAMES), MESSAGES);
			const frame = page.frames().find(f => f.url().includes('game.html'));
			if (frame) await waitForSelector(frame, 'input[data-hook="input"]', { visible: true, timeout: 30000 });
			await sleep(1000);
		}
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
	for (const [token, count] of Object.entries(stats.tokensUsed)) {
		console.log(`${token} was used in ${count} room(s)`);
	}
})();