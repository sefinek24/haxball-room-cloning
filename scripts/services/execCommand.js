const { exec } = require('child_process');

module.exports = command => {
	if (!command) throw new Error('Missing `command`');

	return new Promise((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err && err.code !== 2) return reject(err);
			if (stderr) console.warn(stderr);
			resolve(stdout.trim());
		});
	});
};