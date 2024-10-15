const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const sleep = require('./sleep.js');

const createProfileDir = () => {
	const profilePath = path.join(__dirname, '..', 'chrome', 'profiles', 'raid', Date.now().toString());
	if (!fs.existsSync(profilePath)) fs.mkdirSync(profilePath, { recursive: true });
	return { path: profilePath };
};

const randomShit = length => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

const getRandomNickname = USERNAMES_ARRAY =>
	USERNAMES_ARRAY.length ? USERNAMES_ARRAY[Math.floor(Math.random() * USERNAMES_ARRAY.length)] : randomShit(32);

const pressRandomKeysForMovement = async page => {
	const randomMovementDuration = Math.floor(Math.random() * 4000) + 1000;
	const keysPressed = new Set();

	const moveInRandomDirection = async () => {
		const randomKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'][Math.floor(Math.random() * 4)];
		if (!keysPressed.has(randomKey)) {
			keysPressed.add(randomKey);
			await page.keyboard.down(randomKey);
		}
	};

	const stopAllMovements = async () => {
		for (const key of keysPressed) {
			await page.keyboard.up(key);
		}
		keysPressed.clear();
	};

	const movementInterval = setInterval(moveInRandomDirection, 400);
	await sleep(randomMovementDuration);
	clearInterval(movementInterval);
	await stopAllMovements();
};

const simulateMovement = async (gameView, page) => {
	const movementIntervalId = setInterval(async () => {
		try {
			await gameView.focus();
			await pressRandomKeysForMovement(page);
		} catch (err) {
			clearInterval(movementIntervalId);
			console.error(`Error while moving character: ${err.message}`);
		}
	}, 500);
	await sleep(4000);
	clearInterval(movementIntervalId);
};

const openTargetRoom = async (page, targetRoom) => {
	try {
		await page.goto(targetRoom, { waitUntil: 'networkidle0' });
		console.log(`Navigated to ${targetRoom}`);
	} catch (e) {
		console.error(`Error while loading the page: ${e.message}`);
	}
	page.setDefaultNavigationTimeout(0);
};

const waitForSelectorWithRetry = async (frame, selector, options = {}, retries = 3, delay = 4000) => {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await frame.waitForSelector(selector, options);
		} catch (err) {
			if (err.message.includes('frame got detached')) {
				console.warn(`Attempt ${attempt} failed: frame got detached. Retrying in ${delay}ms...`);
				if (attempt === retries) throw new Error('Max retries reached. Could not find selector.');
				await sleep(delay);
			} else {
				console.error(err);
				return null;
			}
		}
	}
};

const setNickname = async (frame, randomNick) => {
	const nicknameInput = await frame.$('input[data-hook="input"]');
	if (nicknameInput) {
		const currentValue = await frame.evaluate(input => input.value, nicknameInput);
		if (currentValue) {
			await nicknameInput.click({ clickCount: 3 });
			await nicknameInput.press('Backspace');
		}
		await frame.type('input[data-hook="input"]', randomNick, { delay: 10 });
		const okButton = await frame.$('button[data-hook="ok"]');
		if (okButton) await okButton.click();
		console.log(`New nickname '${randomNick}' submitted`);
	} else {
		console.warn('Nickname input not found.');
	}
};

const sendMessages = async (chatInput, MESSAGES_ARRAY, kill) => {
	const messageIntervalId = setInterval(async () => {
		try {
			await chatInput.click();
			await chatInput.type(MESSAGES_ARRAY[Math.floor(Math.random() * MESSAGES_ARRAY.length)], { delay: 1 });
			await chatInput.press('Enter');
		} catch (err) {
			clearInterval(messageIntervalId);
			console.warn(`Error while sending messages: ${err.message}`);
			if (kill) process.exit(666);
		}
	}, 1500);
	await sleep(9000);
	clearInterval(messageIntervalId);
};

const handleRoom = async (frame, frame2, randomNick, MESSAGES_ARRAY, page, kill) => {
	await setNickname(frame, randomNick);
	const chatInput = await waitForSelectorWithRetry(frame2, 'input[data-hook="input"]', { visible: true, timeout: 360000 });
	if (!chatInput) return;

	console.log(`Connected! Username: ${randomNick}`);
	const gameView = await frame2.$('.game-view');
	if (gameView) {
		const executeLoop = async () => {
			await sendMessages(chatInput, MESSAGES_ARRAY, kill);
			await simulateMovement(gameView, page);
			executeLoop();
		};
		executeLoop();
	} else {
		console.warn('Game view not found.');
	}
};

const setupRoom = async (page, randomNick, messagesArray, kill = false) => {
	const frame = page.frames().find(f => f.url().includes('game.html'));
	if (frame) {
		const frame2 = page.frames().find(f => f.url().includes('game.html'));
		await handleRoom(frame, frame2, randomNick, messagesArray, page, kill);
	} else {
		console.warn('Iframe not found.');
	}
};

module.exports = {
	createProfileDir,
	getRandomNickname,
	pressRandomKeysForMovement,
	waitForSelectorWithRetry,
	openTargetRoom,
	handleRoom,
	setupRoom
};