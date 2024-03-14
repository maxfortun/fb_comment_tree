#!/usr/bin/env node

const fs = require('node:fs/promises');

global.handle_Feedback = (state) => {
	const { d } = state;
	state.feedback = { id: d.id };
};

global.handle_Comment = (state) => {
	const { data, comments, feedback, p, d } = state;
	if(!d.body?.text) {
		return;
	}
	const comment = {
		feedback: {
			parent: feedback.id,
			self: d.feedback.id
		},
		author: {
			id: d.author.id,
			name: d.author.name
		},
		text: d.body.text
	}; 
	comments.push(comment);
}

function parseNode(state) {
	const { d } = state;
	const handler = global['handle_'+d.__typename];
	if(!handler) {
		return;
	}
	handler(state);
}


function parseData(state) {
	const { data, comments } = state;
	while(data.length > 0) {
		const { p, d } = data.shift();
		process.stderr.write("\033[0K\r"+p.join('.'));

		if(Array.isArray(d)) {
			for(let i = 0; i < d.length; i++) {
				const value = d[i];
				data.push({ p: p.slice().concat([i]), d: value });
			}
			continue;
		}

		if(typeof d == 'object') {
			for(const key in d) {
				const value = d[key];
				if(key == 'node') {
					Object.assign(state, { p, d: value });
					parseNode(state);
				}
				data.push({ p: p.slice().concat([key]), d: value });
			}
			continue;
		}
	}
	process.stderr.write("\033[0K\r");
}

async function main() {
	const files = process.argv.slice();
	files.shift();
	files.shift();

	for(const file of files) {
		process.stderr.write("\033[0K\r"+file+"\n");
		const string = (await fs.readFile(file)).toString();
		let d = null;
		try {
			d = JSON.parse(string);
		} catch(e) {
			continue;
		}
		const data = [ { p: [], d } ];
		const comments = [];
		parseData({ data, comments });
		await fs.writeFile(file+'.comments', JSON.stringify(comments));
	}
}

main();
