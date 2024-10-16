const USERNAMES = [
	'Pscx1', 'wonderkid', '🐌 Pkt', 'Leeeeniiii', 'ErforTinho', 'six nine', 'zax', 'Zdun', 'Rumpolog', 'Faluś', 'Dawidomad', 'przekozak',
	'MrWorldwide', 'Jack Wilshere', 'Nektar Ananasowy', 'solek', 'hover cat', 'farmer', 'Yezzy>!', 'sucz44', 'FuzzaMuzza', 'FZK',
	'Sbx', 'wonderkid', 'chinczyk', 'RadosnyStolec', 'Mike Dwubiegunowy'
];

const MESSAGES_ENCRYPTED = [
	'YWxlIHplIG1uaWUgcGVkYcWC',
	'SmVzdGVtIHBlZGHFgmVtLg==',
	'a3Vyd2EsIGFsZSBzd8SZZHppIG1uaWUgcHLEhWNpZQ==',
	'amFrIGNoY2VzeiB0byBjaSBvYmNpxIVnbsSZ',
	'a3Vyd2EgbWHEhywgY2h5YmEgbW5pZSBiZWx6ZWJ1YiBvcMSZdGHFgg==',
	'aGFpbCBzYXRhbmFzIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9Z2tCdDd5TFh5RGs=',
	'bHrbp2trCDE=',
	'c3fEmWR6aSBtbmllIHByxIVjaWUsIHBvbW9jeSEh',
	'amVzdGVtIHRyYW5zc2Vrc3VhbG55bSBwacWCa2FyemVtISEhISEhISEhISEh',
	'a29jaGFtIGdkeSBtw7NqIHRhdG8gcm9iaSBtaSBkb2JyemU=',
	'dXdpZWxiaWFtbSBnZHkgd2vFgmFkYSBtaSBzaWUgd2llbGvEhSBrbmFnZSBkbyBtb2plZ28gb2RieXR1',
	'QkFSRFpPIEtPQ0hBTSBCWcSGIEpFQkFOWSBQUlpFWiBDWkFSTlVDSMOTVyE=',
	'bHViaWVtIHcgcGFwdWxjYSBoaWhpIDoz',
	'a29jaGFtIG1vcmlzYSA6MyBpIG9uIGtvY2hhIG1uaWUgOjMz',
	'c2xhdmEgcHV0aW4=',
	'YnJ1aGggYWxlIGphIGt1cndhIHJseSB1a3JhaW5jb3cgbmllbmF3aWR6ZQ=='
];

const decodeBase64Messages = str => str.map(msg => Buffer.from(msg, 'base64').toString('utf-8'));
const decodedMessagesArray = decodeBase64Messages(MESSAGES_ENCRYPTED);

module.exports = { USERNAMES, MESSAGES: [...decodedMessagesArray] };

// https://www.base64encode.org