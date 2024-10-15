const puppeteer = require('puppeteer-extra');
const ProxyChain = require('proxy-chain');
const path = require('node:path');
const plugins = path.join(__dirname, '..', 'chrome', 'plugins');

module.exports = async (proxy, userDataDir, chromePath, browserArgs) => {
	const anonymizedProxy = proxy ? await ProxyChain.anonymizeProxy(proxy) : null;
	return await puppeteer.launch({
		headless: false,
		executablePath: chromePath,
		userDataDir,
		ignoreDefaultArgs: [
			'--disable-extensions',
			'--enable-automation'
		],
		args: [
			anonymizedProxy ? `--proxy-server=${anonymizedProxy}` : '',
			...browserArgs,
			`--disable-extensions-except=${plugins}`,
			`--load-extension=${plugins}`
		].filter(Boolean)
	});
};