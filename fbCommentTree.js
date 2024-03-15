#!/usr/bin/env node

const fs = require('node:fs/promises');

global.handle_Feedback = (state) => {
	const { d } = state;
	state.feedback = { id: d.id };
};

global.handle_Comment = (state) => {
	const { tree, data, comments, feedback, p, d } = state;

	if(!d.body?.text) {
		return;
	}

	const comment = {
		created_time: d.created_time,
		parent: feedback.id,
		id: d.feedback.id,
		author: {
			id: d.author.id,
			name: d.author.name
		},
		text: d.body.text,
		feedback: {
			top_reactions: {
			}
		},
		comments: []
	}; 
	
	d.feedback.top_reactions.edges.forEach(edge => {
		comment.feedback.top_reactions[edge.node.id] = edge.reaction_count;
	});

	if(tree.comments[comment.id]) {
		throw new Error(comment.id+' already exists.');
	}

	tree.comments[comment.id] = comment;
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

function threadComments(tree) {
	for(const id in tree.comments) {
		const comment = tree.comments[id];
		const parent = tree.comments[comment.parent];
		if(!parent) {
			if(!tree.threads[comment.parent]) {
				tree.threads[comment.parent] = {
					comments: []
				};
			}
			tree.threads[comment.parent].comments.push(comment);
			continue;
		}

		parent.comments.push(comment);
	}
}

function printThread(thread, level) {
	if(!level) {
		level = 0;
	}

	if(thread.text) {
		const created_time = new Date(thread.created_time*1000).toISOString();

		const linePad = ''.padStart(level, '  ');
		const nlPad = ''.padStart(created_time.length + level + 1, '  ');

		const text = nlPad+thread.text.replace(/\n/g,"\n"+nlPad);

		const top_reactions = Object.values(thread.feedback.top_reactions).reduce((result, item) => result+=item, 0);

		const line = `${linePad}${thread.author.name}: ${top_reactions} reactions\n${text}`;

		console.log(created_time+line);
	}

	thread.comments.forEach(comment => printThread(comment, level + 1));
}

function printThreads(threads) {
	for(const id in threads) {
		printThread(threads[id]);
	}
}

async function main() {
	const files = process.argv.slice();
	files.shift();
	files.shift();

	const tree = {
		comments: {},
		threads: {}
	};

	for(const file of files) {
		process.stderr.write("\033[0K\r"+file);
		const string = (await fs.readFile(file)).toString();
		let d = null;
		try {
			d = JSON.parse(string);
		} catch(e) {
			continue;
		}
		const data = [ { p: [], d } ];
		const comments = [];
		parseData({ data, comments, tree });
	}

	threadComments(tree);
	printThreads(tree.threads);
}

main();
