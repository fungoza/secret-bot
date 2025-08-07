import { generateFarmQueue, getMe, getTiles, groupPixels, loadChunk, placePixels, sleep, to2d, CHUNK_SIZE, rand } from "./utils";
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
			return [x, y];
		});

		const bitmaps = await Promise.all(chunkCoords.map((value) => loadChunk(value[0], value[1])));

		const firstCoords = chunkCoords[0];

		const noOffsetCoords = chunkCoords.map(s => {
			return [s[0]-firstCoords[0], s[1]-firstCoords[1]];
		});
		
		const offscreenCanvas = new OffscreenCanvas(CHUNK_SIZE*chunkCoords.length, CHUNK_SIZE*chunkCoords.length);
		const ctx = offscreenCanvas.getContext('2d');
		if (!ctx) throw new Error("Cannot get OffscreenCanvasRenderingContext2D");
		for (const tileCoords of noOffsetCoords) {
			ctx.drawImage(bitmaps[noOffsetCoords.indexOf(tileCoords)], tileCoords[0]*1000, tileCoords[1]*1000);
		}
		const leftUpEdge = [global.template.x1-firstCoords[0]*1000, global.template.y1-firstCoords[1]*1000];
		const imageData = ctx.getImageData(leftUpEdge[0], leftUpEdge[1], global.template.width, global.template.height);
		const data = imageData.data;
		// const debugCanvas = document.createElement("canvas");
		// 	debugCanvas.width = imageData.width;
		// 	debugCanvas.height = imageData.height;
		// 	const debugCtx = debugCanvas.getContext("2d");
		// 	if (debugCtx) {
		// 	debugCtx.putImageData(imageData, 0, 0);
		// 	downloadCanvas(debugCanvas);
		// }
		for (let dy = 0; dy < global.template.height+1; dy++) {
			for (let dx = 0; dx < global.template.width+1; dx++) {
				const imgIndex = (dy * global.template.width + dx) * 4;
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