const puppeteer = require('puppeteer-extra');
const path = require('node:path');
const browserArgs = require('./scripts/args.js');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
const sleep = require('./scripts/sleep.js');

const links = [
	'https://www.haxball.com/play?c=XXXXXXXXXXX',
	'https://www.haxball.com/play?c=XXXXXXXXXXX',
	'https://www.haxball.com/play?c=XXXXXXXXXXX',
	'https://www.haxball.com/play?c=XXXXXXXXXXX'
];

const repeatTimes = 6;
const delay = 9000;

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		userDataDir: path.join(__dirname, 'chrome', 'profiles', 'spam'),
		args: [...browserArgs]
	});

	for (let i = 0; i < repeatTimes; i++) {
		for (const link of links) {
			try {
				const page = await browser.newPage();
				await page.goto(link);
				console.log(`Opened ${link} - Instance ${i + 1}`);

				await sleep(delay);
			} catch (err) {
				console.error(`Failed to open ${link} - Instance ${i + 1}`, err);
			}
		}
	}
})();