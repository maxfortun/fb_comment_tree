#!/usr/bin/env node

const fs = require('node:fs/promises');
const { deepParseJson } = require('deep-parse-json');

async function main() {
	const files = process.argv.slice();
	files.shift();
	files.shift();

	for(const file of files) {
		process.stderr.write("\033[0K\r"+file);
		const string = (await fs.readFile(file)).toString();
		const json = deepParseJson(string);
		await fs.writeFile(file+'.deep', JSON.stringify(json));
	}
	console.log("");
}

main();
