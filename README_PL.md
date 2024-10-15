# HaxBall Room Cloning ♿⚽
Ten projekt umożliwia sklonować dowolny pokój HaxBall i nie tylko. Upewnij się, że masz uzasadniony powód przed jego użyciem.

<div align="center">
    [<a href="README.md">ENG</a>] | [<a href="README_PL.md">POL</a>]
</div>
<br>

| Plik                 | Wideo | Beta? | Opis                                                                           |
|----------------------|:------|-------|--------------------------------------------------------------------------------|
| [index.js](index.js) | N/A   | ✅     | Pozwala na sklonowanie jakiegokolwiek pokoju.                                  |
| [spam.js](spam.js)   | N/A   | ✅     | Odpala boty które wchodzą na konkretny room i spamią losowymi wiadomościami.   |
| [raid.js](raid.js)   | N/A   | ❎     | Wpuszcza boty na rooma, które nic nie robią. Jedynie zapychają dostępne sloty. |
| proxies.txt          | N/A   | ❎     | Lista serwerów proxy (najlepiej SOCKS5).                                       |
| tokens.json          | N/A   | ❎     | Lista z tokenami headless oraz ich datą wygenerowania.                         |


## O Haxballu
Gra dla ułomnych 30 latków (większość osób w tej grze ma aspergera), którzy nie mają życia.
Biedni ludzie skrzywdzeni przez los, z marną egzystencją.
Jeśli jesteś weteranem tej gry, pewnie będziesz negować moje słowa. Szczerze? Nie interesuje mnie to.

Basro jebie was na kasę z reklam Google Ads, a sam ma w dupę te gre.
Zrób coś pożytecznego dla swojego kraju (albo i rodziny, której pewnie nie masz), a nie tylko siedzisz przed komputerem i grasz w piłkarzyki online.

## Podatności i błędy Haxball
Warto również tutaj wspomnieć o podatnościach tej gry, jak i o błędach.
Jeśli serwer gry można scrashować, wysyłając do niej spreparowane pakiety UDP, które te potem powodują masę błędów, no to naprawdę nieźle.
Naprawdę nie chce wiedzieć, jakie ta gra ma jeszcze podatności (a na pewno je ma).

## Jak to działa?
1. Skrypt łączy się z losowym proxy (każde proxy reprezentuje jedną przeglądarkę z dwoma zakładkami).
2. Wysyłany jest request GET do mojego API, umożliwiające wygenerowanie tokenu headless.
3. Tokeny są przechowywane w pliku `tokens.json`. Jeśli jakiś token jest przeterminowany, kod automatycznie wygeneruje nowy.
4. Co około ~12 minut skrypt sprawdza, czy dane geolokalizacyjne się zmieniły. Jeśli tak, strona sklonowanego pokoju jest odświeżana i uruchamiana ponownie z nowymi współrzędnymi (`kraj`, `lat`, `lon`).

## Czy można ten kod lepiej napisać? 🤓
Jasne, że tak. Ale po co? Odpowiedz sam sobie na to pytanie.

## Jak użyć tego skryptu?
### Wymagania
1. Będziesz potrzebować [proxy](https://stableproxy.com/?r=SKX2AY).
2. Usługę, która oferuje [automatyczne rozwiązywanie captchy](https://getcaptchasolution.com/df5q6t8krs).

    https://github.com/user-attachments/assets/48012a22-72c0-476b-ac5a-b11647973a20

3. [Node.js + npm](https://nodejs.org) + [PM2](https://pm2.keymetrics.io).
4. Linux (najlepiej wersja serwerowa, oczywiście bez GUI).
5. Wymagane przynajmniej +4GB RAM.

### Użycie + instalacja
```sh
sudo apt update && sudo apt upgrade -y
sudo reboot (jeśli kernel został zaktualizowany)
npm install
mcedit proxy.txt (wklej wszystkie swoje proxy)
cp .env.default .env
mcedit .env (ustaw NODE_ENV na production i dostosuj pozostałe wartości)
sudo apt install libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libdrm2 libexpat1 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libudev1 libuuid1 libx11-6 libx11-xcb1 libxcb-dri3-0 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxkbcommon0 libxrandr2 libxrender1 libxshmfence1 libxss1 libxtst6 (for Ubuntu Server 22.04, see: https://source.chromium.org/chromium/chromium/src/+/main:chrome/installer/linux/debian/dist_package_versions.json)
npm install pm2 -g
pm2 start
pm2 save
pm2 startup
```

### Testowane na
- `Ubuntu Server 22.04` (Proxmox 8.2.7)

## Jak uzyskać współrzędne (lat, lon) każdego pokoju?
Możesz sprawdzić moje API https://api.sefinek.net/api/v2/haxball/room-list.
Użyj parametru `name`, aby uzyskać informacje o konkretnym pokoju. Podanie pełnej nazwy nie jest konieczne.

### Przykłady
#### Wszystkie pokoje
```bash
curl -X GET "https://api.sefinek.net/api/v2/haxball/room-list"
```

#### Konkretny pokój
```bash
curl -X GET "https://api.sefinek.net/api/v2/haxball/room-list?name=haxnball"
```
# GNU General Public License v3.0
Copyright 2024 © by [Sefinek](https://sefine.net). Wszelkie prawa zastrzeżone.