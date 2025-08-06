import Template from "./Template"
import { group } from 'group-items';
import global from "./global";

export const CHUNK_SIZE = 1000;

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