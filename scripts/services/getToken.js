const fs = require('node:fs');
const path = require('node:path');
const axios = require('./axios.js');

const TOKEN_LIFETIME = 2 * 60 * 60 * 1000; // 2 hours
const MAX_RETRIES = 4;
const TOKENS_JSON = path.join(__dirname, '..', '..', 'tokens.json');
const apiKey = process.env.SEFIN_API_SECRET;

const saveTokens = tokens => fs.writeFileSync(TOKENS_JSON, JSON.stringify(tokens, null, 2));

const loadTokens = () => fs.existsSync(TOKENS_JSON) ? JSON.parse(fs.readFileSync(TOKENS_JSON)) : {};

const isTokenValid = tokenData => Date.now() - tokenData.generatedAt < TOKEN_LIFETIME;

const getNewToken = async () => {
	if (!apiKey) throw new Error('SEFIN_API_SECRET is null or undefined');

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			console.log(`[-.-] Generating a new token (Attempt ${attempt}/${MAX_RETRIES})...`);
			const { data } = await axios.get('https://api.sefinek.net/api/v2/haxball/get-token', { headers: { e117703bec5f42a961c6e0cf3f662952: apiKey } });
			if (data.token) {
				console.log(`Generated ${data.token}`);
				return { token: data.token, generatedAt: Date.now() };
			}
		} catch (err) {
			console.error(`Error on attempt ${attempt}:`, err.stack);
		}
	}

	console.error('Failed to generate a valid token after 3 attempts');
	return { token: null, generatedAt: null };
};

module.exports = async roomIndex => {
	const tokens = loadTokens();
	const tokenKey = `TOKEN_${roomIndex}`;

	if (tokens[tokenKey] && isTokenValid(tokens[tokenKey])) {
		return tokens[tokenKey].token;
	}

	const newTokenData = await getNewToken();
	tokens[tokenKey] = newTokenData;
	saveTokens(tokens);
	return newTokenData.token;
};