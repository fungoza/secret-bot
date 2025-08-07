import { generateFarmQueue, getMe, getTiles, groupPixels, loadChunk, placePixels, sleep, to2d, CHUNK_SIZE, rand, hasColor } from "./utils";
import global from "./global";
import { ITargeter, Pixel } from "./types";

export enum STATUSES {
	IDLE,
	WORKS,
	FARM
}

type Charges = {
	cooldownMs: number,
	count: number,
	max: number
}

export default class Bot {
	private targeter: ITargeter
	constructor(targ: ITargeter) {
		this.targeter = targ;
	}
	public status: STATUSES = STATUSES.IDLE
	private lastColor: number = 1;
	private charges: Charges = {
		cooldownMs: 30000,
		count: 0,
		max: 64
	};
	private lastTimeGotCharge: number = Date.now();
	public start() {
		this.status = STATUSES.WORKS;
		return this.loop();
	}
	
	public startFarmer() {
		this.status = STATUSES.FARM;
		return this.loopFarm();
	}
	
	public stop() {
		if(this.status === STATUSES.IDLE) {
			return;
		}
		global.gui.started = false;
		global.gui.startedFarm = false;
		global.gui.updateStartButton();
		global.gui.updateStartFarmButton();
		
		this.status = STATUSES.IDLE;
	}

	public changeTargeter(targe: ITargeter) {
		this.stop();
		this.targeter = targe;
	}

	private async updateInfo() {
		const me = await getMe();
		this.lastTimeGotCharge = Date.now();
		this.charges = me.charges;
		global.extraColorsBitmap = me.extraColorsBitmap;
	}
	
	private async loop() {
		
		await this.updateInfo();

		
		while (this.status === STATUSES.WORKS) {
			const [delay, text] = await this.iteration();
			
			if(this.status !== STATUSES.WORKS) {
				break;
			}
			//const fixedDelay = delay > 6e4 ? delay/3 : 6e4;
			global.gui.appendInfo(`next tick after ${delay} :: ${text}`);
			
			await sleep(delay);
		}
		
		this.status = STATUSES.IDLE;
		return null;
	}
	
	private async loopFarm() {
		
		await this.updateInfo();
		
		while (this.status === STATUSES.FARM) {
			const [delay, text] = await this.iterationFarm();
			
			if(this.status !== STATUSES.FARM) {
				break;
			}
			global.gui.appendInfo(`next tick after ${delay} :: ${text}`);
			
			await sleep(delay);
		}
		
		this.status = STATUSES.IDLE;
		return null;
	}
	
	private async iteration(): Promise<[number, string]> {
		if (this.status !== STATUSES.WORKS) {
			return [0, 'stopped'];
		}
		const storedCount = Math.floor(this.charges.count);

		const count = storedCount+(Math.floor((Date.now()-this.lastTimeGotCharge)/this.charges.cooldownMs));
		
		
		const chunks = getTiles([
			[global.template.x1, global.template.y1], 
			[global.template.x1, global.template.y2],
			[global.template.x2, global.template.y1],
			[global.template.x2, global.template.y2],
		]);
		
		const pixelsData = [];
		
		const chunkCoords = chunks.map(s => {
			const [x, y] = s.split('/').map(Number);
			return { x, y };
		});
		
		const bitmaps = await Promise.all(chunkCoords.map(({x, y}) => loadChunk(x, y)));
		
		const offscreenCanvas = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE);
		const ctx = offscreenCanvas.getContext('2d');
		if (!ctx) throw new Error("Cannot get OffscreenCanvasRenderingContext2D");
		for (let i = 0; i < chunkCoords.length; i++) {
			const { x: chunkX, y: chunkY } = chunkCoords[i];
			const bitmap = bitmaps[i];
			
			
			const chunkAbsX1 = chunkX * CHUNK_SIZE;
			const chunkAbsY1 = chunkY * CHUNK_SIZE;
			const chunkAbsX2 = chunkAbsX1 + CHUNK_SIZE - 1;
			const chunkAbsY2 = chunkAbsY1 + CHUNK_SIZE - 1;
			
			const intersectX1 = Math.max(chunkAbsX1, global.template.x1);
			const intersectY1 = Math.max(chunkAbsY1, global.template.y1);
			const intersectX2 = Math.min(chunkAbsX2, global.template.x2);
			const intersectY2 = Math.min(chunkAbsY2, global.template.y2);
			
			if (intersectX2 < intersectX1 || intersectY2 < intersectY1) {
				continue;
			}
			
			const inChunkX1 = intersectX1 - chunkAbsX1;
			const inChunkY1 = intersectY1 - chunkAbsY1;
			const inChunkWidth = intersectX2 - intersectX1 + 1;
			const inChunkHeight = intersectY2 - intersectY1 + 1;
			
			
			ctx.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE);
			ctx.drawImage(bitmap, 0, 0);
			
			const imageData = ctx.getImageData(inChunkX1, inChunkY1, inChunkWidth, inChunkHeight);
			const data = imageData.data;
			
			for (let dy = 0; dy < inChunkHeight; dy++) {
				for (let dx = 0; dx < inChunkWidth; dx++) {
					const imgIndex = (dy * inChunkWidth + dx) * 4;
					const r = data[imgIndex];
					const g = data[imgIndex + 1];
					const b = data[imgIndex + 2];
					const a = data[imgIndex + 3];
					
					const id = a === 0 ? 0 : global.template.RGBtoid([r, g, b]);
					const pixelX = dx;
					const pixelY = dy;
					if (pixelX < 0 || pixelX >= global.template.width || pixelY < 0 || pixelY >= global.template.height) {
						continue;
					}
					
					pixelsData.push(id);
				}
			}
		}
		global.pixelsData = pixelsData;

		const queue = this.targeter.nexts(count);
		
		if (queue.length === 0) {
			console.log("Image done");
			this.stop();
			return [0, 'stopped'];
		}
		console.log('Placing', queue);
		const grouped = groupPixels(queue);

		await placePixels(grouped);

		await this.updateInfo();

		const delay = (this.charges.max-this.charges.count)*this.charges.cooldownMs;
		
		return [delay/rand(1, 10), 'wait stack'];
	}
	
	private async iterationFarm(): Promise<[number, string]> {
		if (this.status !== STATUSES.FARM) {
			return [0, 'stopped'];
		}
		// getPixels
		const storedCount = Math.floor(this.charges.count);

		const count = storedCount+(Math.floor((Date.now()-this.lastTimeGotCharge)/this.charges.cooldownMs));
		// this.lastColor === 1 ? this.lastColor = 2 : this.lastColor = 1;
		const queue = generateFarmQueue(Math.floor(count), to2d(global.storage.get('coords')!), this.lastColor);
		const groups = groupPixels(queue);
		
		// placePixels
		await placePixels(groups);
		
		// getCooldown
		await this.updateInfo();
		
		return [(this.charges.max-this.charges.count)*this.charges.cooldownMs, 'wait stack'];
	}
}