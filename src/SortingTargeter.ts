import CycledCounter from "./CycledCounter";
import Template from "./Template";
import { Pixel, SortingFunc, Target } from "./types";
import global from "./global";

export default class {
	public targets: Array<Target>
    public template: Template
	private counter: CycledCounter
	private counterarr: Array<number> = []

    get width() {
		return this.template.width;
	}

	get height() {
		return this.template.height;
	}

	constructor(template: Template, sort: SortingFunc) {
        this.template = template;
        if(this.template.readyState === Template.LOADED) {
			this.template.quantize();
		}
		this.targets = this.doShitWithQueue(sort(this.template));
		this.counter = new CycledCounter(this.targets.length);
	}

    protected handleTarget(t: [number, number]) {
		if (t == undefined) {
			throw new Error('bad target');
		}
		const id = this.template.get(t[0], t[1]);
		const cnv = global.pixelsData[t[0]+t[1]*this.template.width]

		if(global.storage.get('onlyOnVirgin') && cnv != 0) {
			return undefined
		}

		if(id == cnv) {
			return undefined;
		}

		return {
			x: t[0] + this.template.x1,
			y: t[1] + this.template.y1,
			id
		}
	}
    

	private doShitWithQueue(targets: Array<Target>) {
		const out: [number, number][] = [];
		const usedPoints: Set<string> = new Set();
		const targetSet: Set<string> = new Set(targets.map(p => `${p[0]},${p[1]}`));
		for (const point of targets) {
			const pointStr = `${point[0]},${point[1]}`;
			if (targetSet.has(pointStr) && !usedPoints.has(pointStr)) {
				out.push(point);
				usedPoints.add(pointStr);
			}
		}
		return out;
	}

	public back(needed: number) {
		this.counter.deinc(needed);
	}

	public setCounter(value: number) {
		this.counter.set(value);
	}

	public nexts(needed: number): Array<Pixel> {
		const targetsAmount = this.targets.length;

		const pixels: Array<Pixel> = [];
		const pixel = this.handleTarget(this.targets[this.counter.get()]);
		if(pixel) {
			if (pixels.push(pixel) === needed) {
				return pixels;
			}
		}
		for(let totalCounter = 0; totalCounter !== targetsAmount; totalCounter++) {
			const pixel = this.handleTarget(this.targets[this.counter.inc()]);
			if(pixel) {
				if (pixels.push(pixel) === needed) {
					this.counter.inc()
					return pixels;
				}
			}
		}
		return pixels;
	}


	public getTemplatePixel(x: number, y: number) {
		return this.template.get(x - this.template.x1, y - this.template.y1);
	}
	public countTargets() {
		return this.targets.length;
	}
}