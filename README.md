# HaxBall Room Cloning ♿⚽
This project lets you clone any HaxBall room and more. Please ensure you have a legitimate reason before using it.

<div align="center">
    [<a href="README.md">ENG</a>] | [<a href="README_PL.md">POL</a>]
</div>
<br>

| File                 | Video | Beta? | Description                                                           |
|----------------------|:------|-------|-----------------------------------------------------------------------|
| [index.js](index.js) | N/A   | ✅     | Enables cloning of any room.                                          |
| [spam.js](spam.js)   | N/A   | ✅     | Deploys bots to join a specific room and send random spam messages.   |
| [raid.js](raid.js)   | N/A   | ❎     | Bots enter the room but do nothing other than occupy available slots. |
| proxies.txt          | N/A   | ❎     | List of proxies (preferably SOCKS5).                                  |
| tokens.json          | N/A   | ❎     | A list of headless tokens, along with their generation dates.         |


## About
A game for deficient 30-year-olds (most of the people in this game have asperger's syndrome), who don’t have lives.
Poor people, hurt by fate, with a miserable existence.
If you are a veteran player of this game, you will probably deny my words. Honestly? I don't care.

Basro is ripping you off with Google Ads money, and he doesn't care about the game.
Do something useful for your country (or your family, which you probably don't have), rather than just sitting in front of a computer playing online soccer.

## HaxBall vulnerabilities and bugs
It's also worth mentioning the vulnerabilities in this game, as well as the bugs.
If the game server can be crashed by sending it crafted UDP packets that then cause a bunch of errors, that's really something.
I really don't want to know what other vulnerabilities this game has (and it definitely has them).

## How does it work?
1. The script connects to a random proxy, where each proxy represents a browser session with two tabs.
2. A GET request is made to an API you must develop, which generates a headless token.
3. Tokens are saved in the `tokens.json` file. If a token expires, the script automatically generates a new one.
4. Every ~12 minutes, the script checks for updates in geolocation data. If changes are detected, the cloned room’s page is refreshed and restarted using the new coordinates (`country`, `lat`, `lon`).

## Can this code be written better? 🤓
Definitely, but for what? Answer that question yourself.

## How to use this script?
### Requirements
1. You will need [a proxy](https://stableproxy.com/?r=SKX2AY).
2. A service that offers [automatic captcha solving](https://getcaptchasolution.com/df5q6t8krs).

    https://github.com/user-attachments/assets/48012a22-72c0-476b-ac5a-b11647973a20

3. [Node.js + npm](https://nodejs.org) + [PM2](https://pm2.keymetrics.io).
4. Linux (preferably a server version, obviously without a GUI).
5. At least +4GB of RAM is required.

### Usage & Installation
```sh
sudo apt update && sudo apt upgrade -y
sudo reboot (if the kernel has been updated)
npm install
mcedit proxy.txt (paste all your proxies)
cp .env.default .env
mcedit .env (set NODE_ENV to production and adjust other values)
sudo apt install libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libdrm2 libexpat1 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libudev1 libuuid1 libx11-6 libx11-xcb1 libxcb-dri3-0 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxkbcommon0 libxrandr2 libxrender1 libxshmfence1 libxss1 libxtst6 (for Ubuntu Server 22.04, see: https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/debian/dist_package_versions.json)
npm install pm2 -g
pm2 start
pm2 save
pm2 startup
```

### Tested on
- `Ubuntu Server 22.04` (Proxmox 8.2.7)

## How to get coordinates (lat, lon) for each room?
You can check my API https://api.sefinek.net/api/v2/haxball/room-list.
Use the `name` parameter to get information about a specific room. It's not necessary to provide the full name.

### Examples
#### All rooms
```bash
curl -X GET "https://api.sefinek.net/api/v2/haxball/room-list"
```

#### Specific room
```bash
curl -X GET "https://api.sefinek.net/api/v2/haxball/room-list?name=haxnball"
```

# GNU General Public License v3.0
Copyright 2024 © by [Sefinek](https://sefine.net). All rights reserved.