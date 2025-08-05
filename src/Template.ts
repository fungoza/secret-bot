import { loadImage, sq } from './utils'
import Rect from './Rect'

type RGB = [number, number, number];

export const errUnloaded = new Error('template unloaded');
export const errUnquantized = new Error('template unquantized');

export type Options = {
	name: string
	x: number
	y: number
	width?: number
	height?: number
}

export default class Template extends Rect {
	static readonly UNLOADED = 0
	static readonly LOADING = 1
	static readonly LOADED = 2
	static readonly QUANTIZED = 3
    private colors: Array<RGB> = [
        [0, 0, 0],
        [60, 60, 60],
        [120, 120, 120],
        [210, 210, 210],
        [255, 255, 255],
        [96, 0, 24],
        [237, 28, 36],
        [255, 127, 39],
        [246, 170, 9],
        [249, 221, 59],
        [255, 250, 188],
        [14, 185, 104],
        [19, 230, 123],
        [135, 255, 94],
        [12, 129, 110],
        [16, 174, 166],
        [19, 225, 190],
        [40, 80, 158],
        [64, 147, 228],
        [96, 247, 242],
        [107, 80, 246],
        [153, 177, 251],
        [120, 12, 153],
        [170, 56, 185],
        [224, 159, 249],
        [203, 0, 122],
        [236, 31, 128],
        [243, 141, 169],
        [104, 70, 52],
        [149, 104, 42],
        [248, 178, 119]
    ]

    // Покупные
    // [
    //     [170, 170, 170],
    //     [165, 14, 30],
    //     [250, 128, 114],
    //     [228, 92, 26],
    //     [214, 181, 148],
    //     [156, 132, 49],
    //     [197, 173, 49],
    //     [232, 212, 95],
    //     [74, 107, 58],
    //     [90, 148, 74],
    //     [132, 197, 115],
    //     [15, 121, 159],
    //     [187, 250, 242],
    //     [125, 199, 255],
    //     [77, 49, 184],
    //     [74, 66, 132],
    //     [122, 113, 196],
    //     [181, 174, 241],
    //     [219, 164, 99],
    //     [209, 128, 81],
    //     [255, 197, 165],
    //     [155, 82, 73],
    //     [209, 128, 120],
    //     [250, 182, 164],
    //     [123, 99, 82],
    //     [156, 132, 107],
    //     [51, 57, 65],
    //     [109, 117, 141],
    //     [179, 185, 209],
    //     [109, 100, 63],
    //     [148, 140, 107],
    //     [205, 197, 158]
    // ]

	public name: string
	public readyState: 0 | 1 | 2 | 3 = Template.UNLOADED

	public ctx: CanvasRenderingContext2D | null = null
	private ids: Uint8Array = new Uint8Array(0)

	public get canvas() {
		return this.ctx?.canvas;
	}

	public get size() {
		return this.width * this.height;
	}

	constructor(opts: Options) {
		super(
			opts.x, opts.y,
			opts.x + (opts.width || 0),
			opts.y + (opts.height || 0));
		this.name = opts.name;
	}

	public get(x: number, y: number) {
		return this.ids[x + y * this.width];
	}

	public isTransparent(x: number, y: number) {
		return this.get(x, y) === 255;
	}

	public countTransparent() {
		if(this.readyState === Template.QUANTIZED) {
			let amount = 0;
			for(const id of this.ids)
				if(id === 255)
					amount++;
			return amount;
		}

		throw errUnquantized;
	}

	public isOutline (x: number, y: number) {
		const clr = this.get(x, y);
		return (
			this.get(x - 1, y - 1) !== clr ||
			this.get(x - 1, y) !== clr ||
			this.get(x - 1, y + 1) !== clr ||
			this.get(x, y - 1) !== clr ||
			this.get(x, y + 1) !== clr ||
			this.get(x + 1, y - 1) !== clr ||
			this.get(x + 1, y) !== clr ||
			this.get(x + 1, y + 1) !== clr);
	}

	public intersects(x1: number, y1: number, x2: number, y2: number) {
		return (
			this.x1 < x2 &&
			this.x2 > x1 &&
			this.y1 < y2 &&
			this.y2 > y1);
	}

	public load(src: string) {
		this.readyState = Template.LOADING;
		return loadImage(src).then(img => {
			this.ctx = <CanvasRenderingContext2D>document.createElement('canvas').getContext('2d');
			this.ctx.canvas.width = this.width = img.width;
			this.ctx.canvas.height = this.height = img.height;
			this.ctx.drawImage(img, 0, 0);
			this.readyState = Template.LOADED;
			return this;
		});
	}
    
    public idToRGB (id: number): RGB | undefined {
		return this.colors[id];
	}

	public convert (r: number, g: number, b: number): number {
		let nearIndex = 0;
		let nearD = Infinity;
		for (let i = 0; i !== this.colors.length; i++) {
			const p = this.colors[i];
			const d = sq(p[0] - r) + sq(p[1] - g) + sq(p[2] - b);

			if (d === 0) {
				return i;
			} else if (d < nearD) {
				nearD = d;
				nearIndex = i;
			}
		}

		return nearIndex;
	}

	public quantize() {
		if(!this.ctx) {
			throw errUnloaded;
		}

		const id = this.ctx.getImageData(0, 0, this.width, this.height);
		const data = id.data;
		this.ids = new Uint8Array(data.length >> 2);

		const cache = new Map<number, number>();

		for(let i = 0; i !== data.length; i+=4){
			if(data[i | 3] === 0) {
				this.ids[i >> 2] = 255;
				data[i | 0] = data[i | 1] = data[i | 2] = data[i | 3] = 0;
			} else {
				const hash = data[i | 0] << 16 | data[i | 1] << 8 | data[i | 2];

				let clr = cache.get(hash);
				if(!clr) {
					clr = this.convert(hash >> 16, hash >> 8 & 255, hash & 255);
					cache.set(hash, clr);
				}

				this.ids[i >> 2] = clr;

				const rgb = <RGB>this.idToRGB(clr);
				data[i | 0] = rgb[0];
				data[i | 1] = rgb[1];
				data[i | 2] = rgb[2];
				data[i | 3] = 255;
			}
		}

		this.ctx.putImageData(id, 0, 0);

		this.readyState = Template.QUANTIZED;

		return this;
	}
}