require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const browserArgs = require('./scripts/args.js');
const execCommand = require('./scripts/services/execCommand.js');
const sleep = require('./scripts/sleep.js');
const launchBrowser = require('./scripts/launchBrowser.js');
const { getRandomNickname, openTargetRoom, setupRoom } = require('./scripts/utils.js');

// Config
const USERNAMES_ARRAY = ['Zdun lamus', 'Zdun to kurwa', 'Sukinsyn Zdun', 'Rumpolog to pizda', 'Jebać Zduna', 'Knur Rumpolog', 'Wielki Knurzy Zdun', 'Pierdolony Knuras Zdun', 'Skurwysyn Zdun'];
const MESSAGES_ARRAY = [ '﷽﷽ ﷽﷽﷽ ﷽﷽﷽', 'Zdun to jebany prawiczek'];

// Inne
const chromePath = path.join(__dirname, 'chrome', `${process.env.NODE_ENV === 'production' ? 'linux' : 'win64'}-126.0.6478.182`, `chrome-${process.env.NODE_ENV === 'production' ? 'linux64' : 'win64'}`, `chrome${process.env.NODE_ENV === 'production' ? '' : '.exe'}`);
const plugins = path.join(__dirname, 'chrome', 'plugins');

(async () => {
	const userDataDir = path.join(__dirname, '..', 'chrome', 'profiles', 'bots');
	if (fs.existsSync(userDataDir)) fs.rmSync(userDataDir, { recursive: true, force: true });

	try {
		const randomNick = getRandomNickname(USERNAMES_ARRAY);

		await execCommand('nordvpn connect');
		console.log('NordVPN reconnected with a new IP');
		await sleep(5000);

		const browser = await launchBrowser(null, userDataDir, chromePath, browserArgs, plugins);
		const pages = await browser.pages();
		const page = pages.length > 0 ? pages[0] : await browser.newPage();

		page.on('console', msg => {
			const text = msg.text();
			if (msg.type() === 'error') console.error(text);
			else if (msg.type() === 'warning') console.warn(text);
			else console.log(text);
		});

		await openTargetRoom(page, process.env.TARGET_ROOM);
		await setupRoom(page, randomNick, MESSAGES_ARRAY, true);
	} catch (err) {
		console.error(err);
	}
})();