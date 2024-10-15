require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const browserArgs = require('./scripts/args.js');
const launchBrowser = require('./scripts/launchBrowser.js');
const { getRandomNickname, createProfileDir, openTargetRoom, setupRoom } = require('./scripts/utils.js');

// Config
const TARGET_ROOM = process.env.TARGET_ROOM;
const MAX_BROWSERS = 16;
const LAUNCH_DELAY = 200;
const USERNAMES_ARRAY = [
	'Pscx1', 'wonderkid', '🐌 Pkt', 'Leeeeniiii', 'ErforTinho', 'six nine', 'zax', 'Zdun', 'Faluś', 'Dawidomad', 'przekozak',
	'MrWorldwide', 'Jack Wilshere', 'Nektar Ananasowy', 'solek', 'hover cat', 'farmer', 'Yezzy>!', 'sucz44', 'FuzzaMuzza', 'FZK',
	'Sbx', 'wonderkid', 'chinczyk', 'RadosnyStolec'
];
const MESSAGES_ARRAY = [ '﷽﷽ ﷽﷽﷽ ﷽﷽﷽', 'JEBAĆ ZDUNA CWELA JEBANEGO'];

// Inne
const chromePath = path.join(__dirname, 'chrome', 'win64-126.0.6478.182', 'chrome-win64', 'chrome.exe');

(async () => {
	const plugins = path.join(__dirname, 'chrome', 'plugins');
	console.log(`Plugins: ${plugins}`);

	const proxies = fs.readFileSync(path.join(__dirname, 'proxies.txt'), 'utf-8').split('\n').filter(Boolean);
	let browserLaunchCount = 0;

	for (const proxy of proxies) {
		if (browserLaunchCount >= MAX_BROWSERS) break;

		const profile = createProfileDir();
		if (fs.existsSync(profile.path)) fs.rmSync(profile.path, { recursive: true, force: true });

		const randomNick = getRandomNickname(USERNAMES_ARRAY);
		console.log(`Starting (${randomNick}): ${profile.path}`);

		const browser = await launchBrowser(proxy, profile.path, chromePath, browserArgs, plugins);
		browserLaunchCount++;

		const pages = await browser.pages();
		const page = pages.length > 0 ? pages[0] : await browser.newPage();

		await openTargetRoom(page, TARGET_ROOM);
		await setupRoom(page, randomNick, MESSAGES_ARRAY);

		if (MAX_BROWSERS > 1) await new Promise(resolve => setTimeout(resolve, LAUNCH_DELAY));
	}
})();
