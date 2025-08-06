import { generateFarmQueue, getMe, groupPixels, placePixels, sleep, to2d } from "./utils";
import global from "./global";

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
    public status: STATUSES = STATUSES.IDLE
	private lastColor: number = 1;
	private charges: Charges = {
		cooldownMs: 30000,
		count: 0,
		max: 64
	};
    // public start() {
	// 	this.status = STATUSES.WORKS;
	// 	return this.loop();
	// }

    public startFarmer() {
		this.status = STATUSES.FARM;
		return this.loopFarm();
	}
	
	public stop() {
		if(this.status === STATUSES.IDLE) {
			return;
		}

        this.status = STATUSES.IDLE;
	}

    private async loopFarm() {

		const me = await getMe();
		this.charges = me.charges;
		
		while (this.status === STATUSES.FARM) {
			const [delay, text] = await this.iterationFarm();
			
			if(this.status !== STATUSES.FARM) {
				break;
			}
			//const fixedDelay = delay > 6e4 ? delay/3 : 6e4;
			global.gui.appendInfo(`next tick after ${delay} :: ${text}`);
			
			await sleep(delay);
		}
		
		this.status = STATUSES.IDLE;
		return null;
	}
	
    private async iterationFarm(): Promise<[number, string]> {
        if (this.status !== STATUSES.FARM) {
			return [0, 'stopped'];
		}
		// getPixels
		const count = this.charges.count;
		this.lastColor === 1 ? this.lastColor = 2 : this.lastColor = 1;
		const queue = generateFarmQueue(Math.floor(count), to2d(global.storage.get('coords')!), this.lastColor);
		const groups = groupPixels(queue);

		// placePixels
		await placePixels(groups);

		// getCooldown
		const me = await getMe();
		this.charges = me.charges;

		return [(this.charges.max-this.charges.count)*this.charges.cooldownMs, 'wait stack'];
    }
}