import Template from './Template'
import { SortingFunc, Target } from './types';
import { getBorderPixels, shuffle, sortAscending, sortDescending, sortNear, swap } from './utils';

export const createTargets = (tmp: Template) => {
	let targets: Array<Target> = [];
	
	const w = tmp.width;
	const h = tmp.height;
	for(let y = 0; y !== h; y++)
		for(let x = 0; x !== w; x++)
			if(!tmp.isTransparent(x, y))
				targets.push([x, y]);
	return targets;
}

export default <Record<string, SortingFunc>>{
    down: (tmp: Template) => createTargets(tmp),
	up: (tmp: Template) => {
		return createTargets(tmp).reverse();
	},
    left: (tmp: Template) => {
		return sortDescending(createTargets(tmp), t => t[0]);
	},
	right: (tmp: Template) => {
		return sortAscending(createTargets(tmp), t => t[0]);
	},
    colorByColorUp: (tmp: Template) => {
		let all = createTargets(tmp);
		const colors: Record<number, Array<Target>> = {};
		
		all.forEach(t => {
			const clr = tmp.get(t[0], t[1]);
			const group = colors[clr];
			if (!group) {
				colors[clr] = [t];
			} else {
				group.push(t);
			}
		});
		
		all = new Array(all.length);
		
		let i = 0;
		shuffle(Object.values(colors)).forEach(colorGroup => {
			for (let i = 0; i !== colorGroup.length >> 1; i++) {
				const j = colorGroup.length - i - 1;
				swap(colorGroup, i, j);
			}
			colorGroup.forEach(t => all[i++] = t);
		});
		
		return all;
	},
	colorByColorDown: (tmp: Template) => {
		let all = createTargets(tmp);
		const colors: Record<number, Array<Target>> = {};
		
		all.forEach(t => {
			const clr = tmp.get(t[0], t[1]);
			const group = colors[clr];
			if (!group) {
				colors[clr] = [t];
			} else {
				group.push(t);
			}
		});
		
		all = new Array(all.length);
		let i = 0;
		shuffle(Object.values(colors)).forEach(colorGroup => {
			colorGroup.forEach(t => all[i++] = t);
		});
		
		return all;
	},
	borders: (tmp: Template) => {
		const borderPixels = getBorderPixels(createTargets(tmp));
		return sortNear(shuffle(borderPixels));
	},
}