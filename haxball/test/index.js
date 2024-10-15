require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('node:fs/promises');
const path = require('node:path');
const browserArgs = require('../../scripts/args.js');

const { NODE_ENV, TEST_ROOM_TOKEN } = process.env;
console.log(`* NODE_ENV: ${NODE_ENV}\n`);

const roomScript = './haxball/test/room.js';

const injectScript = async page => {
	let scriptContent = await fs.readFile(roomScript, 'utf8');
	scriptContent = scriptContent
		.replace(/\{NODE_ENV}/g, NODE_ENV)
		.replace(/\{TOKEN}/g, TEST_ROOM_TOKEN);
	await page.evaluate(scriptContent);
};

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		devtools: NODE_ENV === 'development',
		userDataDir: path.resolve(__dirname, '..', '..', 'chrome', 'profiles', 'test'),
		args: browserArgs
	});

	const pages = await browser.pages();
	let firstPageUsed = false, page;
	if (!firstPageUsed) {
		page = pages[0];
		firstPageUsed = true;
	} else {
		page = await browser.newPage();
	}

	await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle0' });

	await injectScript(page, roomScript);
	console.log('[INFO]: Script injected');

	page.on('console', msg => {
		const text = msg.text();
		if (msg.type() === 'error') console.error(text);
		else if (msg.type() === 'warning') console.warn(text);
		else console.log(text);
	});

	page.on('framenavigated', async frame => {
		if (frame === page.mainFrame()) {
			console.log('[INFO]: Frame was reloaded. Waiting 1s before injecting...');

			setTimeout(async () => {
				await injectScript(page);
				console.log('[INFO]: Script was injected after reload');
			}, 1000);
		}
	});

	const closeBrowser = async () => {
		console.log('Closing browser...');
		await browser.close();
		process.exit(0);
	};

	process.on('SIGINT', closeBrowser);
	process.on('SIGTERM', closeBrowser);

	if (NODE_ENV === 'development') return;
	try {
		process.send('ready');
	} catch (err) {
		console.error(`Error sending ready signal to PM2. ${err.message}`);
	}
})();