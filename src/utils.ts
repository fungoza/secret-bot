import Template from "./Template"

export type Pixel = {
	x: number
	y: number
	id: number
}

export function sleep(ms: number) {  
    return new Promise(resolve => setTimeout(resolve, ms))  
}

export const sq = (x: number) => x * x;

export const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
	const img = new Image();
	img.crossOrigin = '';
	img.onload = () => resolve(img);
	img.onerror = reject;
	img.src = src;
});

export function to2d(govno: string) {
    if (!govno.includes('/')) console.log('wrong usage of to2d');
    const rawparts = govno.split('/');
    const parts = rawparts.map(Number);
    const x = parts[0]*1000+parts[2];
    const y = parts[1]*1000+parts[3];
    return [x, y];
}

export function to4d(govno: number[], asStr: boolean = false): string | number[] {
    if (govno.length != 2) console.log('wrong usage of to4d');
    const tileX = Math.floor(govno[0] / 1000);
    const tileY = Math.floor(govno[1] / 1000);
    const x = govno[0] % 1000;
    const y = govno[1] % 1000;
    return asStr ? `${tileX}/${tileY}/${x}/${y}` : [tileX, tileY, x, y];
}

export function makePlacePacket(pixels: Array<Pixel>): { colors: number[], coords: number[] } {
    const colors: number[] = []
    const coords: number[] = []

    for (const pixel of pixels) {
        colors.push(pixel.id)
        coords.push(pixel.x, pixel.y)
    }

    return { colors, coords }
}

export const createTargets = (tmp: Template) => {
	let targets: [number, number][] = [];
	
	const w = tmp.width;
	const h = tmp.height;
	for(let y = 0; y !== h; y++)
		for(let x = 0; x !== w; x++)
			if(!tmp.isTransparent(x, y))
				targets.push([x, y]);
	return targets;
}