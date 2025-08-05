import global from './global'
const root = unsafeWindow;
const _fetch = root.fetch;
root.fetch = function fetch(url: RequestInfo | URL, options?: RequestInit) {
	const stringUrl = url instanceof Request ? url.url : url.toString();
	const regex = /https{0,1}\:\/\/backend\.wplace\.live\/s(-{0,1}\d+?)\/pixel\/(-{0,1}\d+?)\/(-{0,1}\d+?)\?x=(-{0,1}\d+?)&y=(-{0,1}\d+?)/;
	const s = regex.exec(stringUrl);
	if (s) {
		global.storage.set('season', +s[1]);
		global.tempCoords = `${s[2]}/${s[3]}/${s[4]}/${s[5]}`;
	}

	// console.log('allow', path);
	return _fetch(url, options);
}