import Template from "./Template"
import { group } from 'group-items';
import global from "./global";
import { BasicTargeterBuilder, Pixel, Target } from "./types";

export const CHUNK_SIZE = 1000;

export const sortAscending = <T>(slice: Array<T>, handle: (x: T) => number) => (slice.sort((a: T, b: T) => handle(a) > handle(b) ? 1 : -1));

export const sortDescending = <T>(slice: Array<T>, handle: (x: T) => number) => (slice.sort((a: T, b: T) => handle(a) < handle(b) ? 1 : -1));

export const shuffle = <T>(array: Array<T>) => {
	for (let i = array.length - 1; i !== -1; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	
	return array;
}

export const swap = <T>(arr: Array<T>, i: number, j: number) => {
	const buffer = arr[i];
	arr[i] = arr[j];
	arr[j] = buffer;
}

export const getBorderPixels = (pixels: Array<[number, number]>): Array<[number, number]> => {
	const pixelSet = new Set<string>(pixels.map(pixel => pixel.join(',')));
	const borderPixels: Array<[number, number]> = [];
	
	const isBorderPixel = (x: number, y: number): boolean => {
		const neighbors = [
			[x - 1, y], // влево
			[x + 1, y], // вправо
			[x, y - 1], // вверх
			[x, y + 1]  // вниз
		];
		
		return neighbors.some(([nx, ny]) => !pixelSet.has(`${nx},${ny}`));
	};
	
	for (const [x, y] of pixels) {
		if (isBorderPixel(x, y)) {
			borderPixels.push([x, y]);
		}
	}
	
	return borderPixels;
}

export function sortNear(targets: Array<Target>): Array<Target> {
    if(targets.length < 5) {
        return shuffle(targets);
    }
    
    const distance = (t1: Target, t2: Target): number => sq(t1[0] - t2[0]) + sq(t1[1] - t2[1]);
    
    for(let i = 0; i !== targets.length - 1; i++) {
        const current = targets[i];
        let closest = i + 1;
        let closestDistance = distance(current, targets[closest]);
        for(let j = i + 2; j !== targets.length; j++) {
            const toCheck = targets[j];
            const d = distance(current, toCheck);
            if(d < closestDistance) {
                closestDistance = d;
                closest = j;
            }
        }
        
        swap(targets, i + 1, closest);
    }
    
    return targets
}

export function hasColor(e: number): boolean {
    if (e < 32) {
        return true;
    }
    const bitmap = global.extraColorsBitmap ?? 0;
    return (bitmap & (1 << (e - 32))) !== 0;
}

export async function getExtraColorsBitmap() {
    const me = await getMe();
    global.extraColorsBitmap = me.extraColorsBitmap;
}

export function sleep(ms: number) {  
    return new Promise(resolve => setTimeout(resolve, ms))  
}

export const rand = (min: number, max: number, decimalPlaces: number = 0): number => {
	if (max == min) return min;
	if (max < min) {
		[min, max] = [max, min];
	}
	const randomValue = min + Math.random() * (max - min);
	return decimalPlaces === 0 ? Math.floor(randomValue) : Number(randomValue.toFixed(decimalPlaces));
}

export const sq = (x: number) => x * x;

export const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = '';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

export function to2d(govno: string): [number, number] {
    if (!govno.includes('/')) console.log('wrong usage of to2d');
    const rawparts = govno.split('/');
    const parts = rawparts.map(Number);
    const x = parts[0]*1000+parts[2];
    const y = parts[1]*1000+parts[3];
    return [x, y];
}

export function to4d(govno: number[], asStr: boolean = false): string | [number, number, number, number] {
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

export function getStrategyList(obj: Record<string, BasicTargeterBuilder>): string[] {
    return Object.keys(obj);
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

export async function getMe() {
    return await (await fetch("https://backend.wplace.live/me", {
        "credentials": 'include',
        "method": "GET",
    })).json();
}

export function generateFarmQueue(count: number, offset: [number, number], color: number): Pixel[] {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(<Pixel>{x: offset[0]+i, y: offset[1], id: color});
    }
    return result;
}

export function getTiles(pixels: [number, number][]) {
    const result: string[] = [];
    for (const pixel of pixels) {
        const pixelstr = `${Math.floor(pixel[0]/1000)}/${Math.floor(pixel[1]/1000)}`;
        if (!result.includes(pixelstr)) {
            result.push(pixelstr);
        }
    }
    return result;
}


export function groupPixels(pixels: Pixel[]) {
    const result: Record<string, { colors: number[]; coords: number[] }> = {};
    const groupedMap = group(pixels)
    .by(({ x, y }) => {
        const tileX = Math.floor(x / 1000);
        const tileY = Math.floor(y / 1000);
        return `${tileX}/${tileY}`;
    })
    .asMap();
    
    for (const [tileKey, groupPixels] of groupedMap.entries()) {
        const colors = groupPixels.map(p => p.id);
        const [tileX, tileY] = tileKey.split('/').map(Number);
        const coords = [];
        for (const p of groupPixels) {
            coords.push(p.x - tileX * 1000, p.y - tileY * 1000);
        }
        result[tileKey] = { colors, coords };
    }
    
    return result;
}

export async function placePixels(groups: Record<string, { colors: number[]; coords: number[] }>): Promise<void> {
    
    const requests = Object.entries(groups).map(async ([groupName, data]) => {
        const response = await fetch(`https://backend.wplace.live/s${global.storage.get('season') || 0}/pixel/${groupName}`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ colors: data.colors, coords: data.coords }),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to place pixels for group ${groupName}: ${response.statusText}`);
        }
    });
    
    await Promise.all(requests);
}

export async function loadChunk(x: number, y: number): Promise<ImageBitmap> {
    const url = `https://backend.wplace.live/files/s${global.storage.get('season') || 0}/tiles/${x}/${y}.png`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load chunk ${x}/${y} (${resp.status})`);
    const blob = await resp.blob();
    // Есть прямой способ загрузить ImageBitmap из blob, сильно быстрее чем через Image+canvas
    return await createImageBitmap(blob);
}