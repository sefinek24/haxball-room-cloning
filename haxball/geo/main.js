const buttonElement = document.querySelector('button');
const statsElement = document.querySelector('.stats');
const fieldElement = document.querySelector('#filter-field');
const valueElement = document.querySelector('#filter-value');

const table = new Tabulator('#room-list', {
	maxHeight: 550,
	layout: 'fitDataFill',
	columns: [
		{ title: 'Name', field: 'name', width: 550 },
		{
			title: 'Players', field: 'players', hozAlign: 'center', formatter: printPlayers, sorter: (a, b, aRow, bRow) => {
				const data1 = aRow.getData();
				const data2 = bRow.getData();
				return data1.players - data2.players;
			}
		},
		{ title: 'Pass', field: 'pass', hozAlign: 'center', formatter: printPassword },
		{ title: 'Flag', field: 'flag', hozAlign: 'center', formatter: printFlag },
		{ title: 'Latitude', field: 'lat', hozAlign: 'center' },
		{ title: 'Longitude', field: 'long', hozAlign: 'center' }
	],
	rowFormatter: row => {
		const data = row.getData();
		if (data.players == data.maxPlayers) row.getElement().style.color = 'red';
	}
});

table.on('rowDblClick', (e, row) => {
	const data = row.getData();
	window.open(`https://www.haxball.com/play?c=${data.id}${data.password ? '&p=1' : ''}`);
});

buttonElement.addEventListener('click', () => {
	load().then(data => parseRooms(new Reader(new DataView(data))));
});

fieldElement.addEventListener('change', updateFilter);
valueElement.addEventListener('keyup', updateFilter);
document.querySelector('#filter-clear').addEventListener('click', () => {
	fieldElement.value = '';
	valueElement.value = '';
	table.clearFilter();
});

function updateFilter() {
	const filterVal = fieldElement.options[fieldElement.selectedIndex].value;

	if (filterVal === 'flag') {
		table.setFilter(filterVal, '=', valueElement.value);
	} else {
		table.setFilter(filterVal, 'like', valueElement.value);
	}
}


function printFlag(cell) {
	const flagCode = cell.getValue();
	return `<div data-hook="flag" class="flagico f-${flagCode}"></div>`;
}

function printPlayers(cell) {
	const data = cell.getData();
	return `${data.players}/${data.maxPlayers}`;
}

function printPassword(cell) {
	const data = cell.getData();
	return `${data.password ? 'Yes' : 'No'}`;
}

async function load() {
	const req = await fetch('https://corsproxy.io/?https://www.haxball.com/rs/api/list');
	return await req.arrayBuffer();
}

class Reader {
	constructor(data) {
		this.data = data;
		this.bytesOffset = 1; // Skip byte index 0 from list
	}

	// Haxball code
	decodeCharacter(a, b) {
		let c = a.getUint8(b),
			d, e, f, g, k, l = b;
		if ((c & 128) == 0) {++b;}
		else if ((c & 224) == 192) {d = a.getUint8(b + 1), c = (c & 31) << 6 | d & 63, b += 2;}
		else if ((c & 240) == 224) {d =
            a.getUint8(b + 1), e = a.getUint8(b + 2), c = (c & 15) << 12 | (d & 63) << 6 | e & 63, b += 3;}
		else if ((c & 248) == 240) {d = a.getUint8(b + 1), e = a.getUint8(b + 2), f = a.getUint8(b + 3), c = (c & 7) << 18 | (d & 63) << 12 | (e & 63) << 6 | f & 63, b += 4;}
		else if ((c & 252) == 248) {d = a.getUint8(b + 1), e = a.getUint8(b + 2), f = a.getUint8(b + 3), g = a.getUint8(b + 4), c = (c & 3) << 24 | (d & 63) << 18 | (e & 63) << 12 | (f & 63) << 6 | g & 63, b += 5;}
		else if ((c & 254) == 252) {d = a.getUint8(b + 1), e = a.getUint8(b + 2), f = a.getUint8(b + 3), g = a.getUint8(b + 4), k = a.getUint8(b + 5), c = (c & 1) << 30 | (d & 63) << 24 | (e & 63) << 18 | (f & 63) << 12 | (g & 63) << 6 | k & 63,
		b += 6;}
		else {throw new Error('Cannot decode UTF8 character at offset ' + b + ': charCode (' + c + ') is invalid');}
		return {
			'char': c,
			length: b - l
		};
	}

	// TextDecoder fine for room ID characters, fixed bytes length (11)
	getID() {
		const length = this.data.getUint16(this.bytesOffset);
		this.bytesOffset += 2;
		const ID = new TextDecoder().decode(this.data.buffer.slice(this.bytesOffset, length + this.bytesOffset));
		this.bytesOffset += length;
		return ID;
	}

	getVersion() {
		// Skip room data length in bytes (uint16) big-endian
		this.bytesOffset += 2;
		const version = this.data.getUint16(this.bytesOffset, true);
		this.bytesOffset += 2;
		return version;
	}

	// [Modified] Haxball code to decode emojis etc.
	getName() {
		let length = this.data.getUint8(this.bytesOffset, true);
		this.bytesOffset++;
		let b = this.bytesOffset;
		let c;
		let name = '';
		for (length = b + length; b < length;) {
			c = this.decodeCharacter(this.data, b);
			b += c.length;
			name += String.fromCodePoint(c['char']);
		}
		if (b != length) throw new Error('Actual string length differs from the specified: ' + (b - length) + ' bytes');
		this.bytesOffset = b;
		return name;
	}

	// TextDecoder fine for flag code characters
	getFlag() {
		const length = this.data.getUint8(this.bytesOffset, true);
		this.bytesOffset++;
		const flag = new TextDecoder().decode(this.data.buffer.slice(this.bytesOffset, length + this.bytesOffset));
		this.bytesOffset += length;
		return flag;
	}

	getLatitude() {
		const latitude = this.data.getFloat32(this.bytesOffset, true);
		this.bytesOffset += 4;
		return latitude;
	}

	getLongitude() {
		const longitude = this.data.getFloat32(this.bytesOffset, true);
		this.bytesOffset += 4;
		return longitude;
	}

	isPassword() {
		const pass = this.data.getUint8(this.bytesOffset, true);
		this.bytesOffset++;
		return pass;
	}

	getPlayersLimit() {
		const limit = this.data.getUint8(this.bytesOffset, true);
		this.bytesOffset++;
		return limit;
	}

	getPlayers() {
		const players = this.data.getUint8(this.bytesOffset, true);
		this.bytesOffset++;
		return players;
	}
}

function parseRooms(a) {
	const rooms = [];
	let totalPlayers = 0;
	while (a.data.byteLength - a.bytesOffset !== 0) {
		const room = {
			id: a.getID(),
			version: a.getVersion(),
			name: a.getName(),
			flag: a.getFlag(),
			lat: a.getLatitude(),
			long: a.getLongitude(),
			password: a.isPassword(),
			maxPlayers: a.getPlayersLimit(),
			players: a.getPlayers()
		};
		totalPlayers += room.players;
		rooms.push(room);
	}
	statsElement.textContent = `${totalPlayers} players in ${rooms.length} rooms`;
	table.replaceData(rooms);
	table.refreshFilter();
	// return console.log(rooms);
}