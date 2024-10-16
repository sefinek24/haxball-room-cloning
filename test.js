require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const ping = require('ping');
// const huaweiLteApi = require('huawei-lte-api');
const browserArgs = require('./scripts/args.js');
const execCommand = require('./scripts/services/execCommand.js');
const launchBrowser = require('./scripts/launchBrowser.js');
const { getRandomNickname, openTargetRoom, setupRoom } = require('./scripts/utils.js');
const sleep = require('./scripts/sleep.js');

const USERNAMES = ['Zdun lamus', 'Zdun to kurwa', 'Sukinsyn Zdun', 'Rumpolog to pizda', 'Jebać Zduna', 'Knur Rumpolog', 'Wielki Knurzy Zdun', 'Pierdolony Knuras Zdun', 'Skurwysyn Zdun', 'Poker Syn Kurwy'];
const MESSAGES = ['﷽﷽ ﷽﷽﷽ ﷽﷽﷽', 'Zdun to jebany prawiczek', '000 POKER TO SYN KURWY 0000'];

const connection = new huaweiLteApi.Connection(process.env.ROUTER_URL);

// const rebootRouter = async () => {
// 	for (let attempt = 1; attempt <= 5; attempt++) {
// 		try {
// 			await connection.ready;
// 			const device = new huaweiLteApi.Device(connection);
// 			await device.reboot();
// 			console.log('Router is rebooting...');
// 			await sleep(40000);
// 			return true;
// 		} catch (error) {
// 			console.error(`Error during router reboot. Attempt ${attempt}:`, error);
// 			await sleep(15000);
// 		}
// 	}
// 	console.error('Failed to reboot router after multiple attempts.');
// 	return false;
// };

const waitForInternet = async () => {
	for (let attempt = 1; attempt <= 20; attempt++) {
		const res = await ping.promise.probe('8.8.8.8');
		if (res.alive) {
			console.log('Internet is back online.');
			return true;
		}
		console.log(`Internet offline. Attempt ${attempt}. Retrying...`);
		await sleep(5000);
	}
	console.error('Failed to reconnect to the internet after multiple attempts.');
	return false;
};

const handleDisconnection = async (browser, proxy, kill) => {
	console.log('Handling disconnection...');
	await browser.close();

	// if (await rebootRouter() && await waitForInternet()) {
	// 	console.log('Reboot completed. Restarting the browser...');
	// 	await initializeBrowser(proxy, kill);
	// }
};

const checkRoomStatus = async (page, browser, proxy, kill) => {
	try {
		const frame = page.frames().find(f => f.url().includes('game.html'));
		if (!frame) return false;

		const isDisconnected = await frame.evaluate(() => !!document.querySelector('.disconnected-view'));
		if (isDisconnected) {
			console.log('User disconnected from the room.');
			await handleDisconnection(browser, proxy, kill);
			return true;
		}
		return false;
	} catch (error) {
		console.error('Error checking room status:', error);
		return false;
	}
};

const initializeBrowser = async (proxy, kill) => {
	const userDataDir = path.join(__dirname, 'chrome', 'profiles', 'bots', Date.now().toString());
	if (fs.existsSync(userDataDir)) fs.rmSync(userDataDir, { recursive: true, force: true });

	const browser = await launchBrowser(proxy, userDataDir, browserArgs);
	const [page] = await browser.pages() || [await browser.newPage()];

	setInterval(async () => {
		await checkRoomStatus(page, browser, proxy, kill);
	}, 5000);

	await openTargetRoom(page, process.env.TARGET_ROOM);
	await setupRoom(page, getRandomNickname(USERNAMES), MESSAGES, kill);
};

(async () => {
	try {
		if (process.env.MODE === '1') {
			await execCommand('nordvpn connect');
			console.log('NordVPN connected with a new IP');
			await sleep(5000);
			await initializeBrowser(null, true);
		} else if (process.env.MODE === '2') {
			const proxies = fs.readFileSync('proxies2.txt', 'utf-8').split('\n').filter(Boolean);
			for (let i = 0; i < 12; i++) {
				await initializeBrowser(proxies[i % proxies.length], false);
			}
		}
	} catch (err) {
		console.error(err);
	}
})();