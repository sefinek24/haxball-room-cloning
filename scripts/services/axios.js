const axios = require('axios');
const { name, version, homepage } = require('../../package.json');

axios.defaults.headers.common = {
	'User-Agent': `Mozilla/5.0 (compatible; ${name}/${version}; +${homepage})`,
	'Accept': 'application/json;v=b3;q=0.7',
	'Accept-Encoding': 'gzip, deflate, br',
	'Accept-Language': 'en-US,en;q=0.9',
	'Cache-Control': 'max-age=0',
	'Connection': 'keep-alive',
	'Upgrade-Insecure-Requests': '1',
	'Sec-Fetch-Dest': 'document',
	'Sec-Fetch-Mode': 'navigate',
	'Sec-Fetch-Site': 'same-origin',
	'Sec-Fetch-User': '?1',
	'Sec-CH-UA-Mobile': '?0',
	'Priority': 'u=0, i'
};

module.exports = axios;