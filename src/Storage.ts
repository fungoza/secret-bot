declare const GM_getValue: <T>(key: string, defaultValue?: T) => T;
declare const GM_setValue: (key: string, value: any, noCache?: boolean) => void;
declare const GM_listValues: () => string[];

export type Options = Partial<{
	storageKey: string
}>

export type ValueMap = Record<string, any>

export type ValueKey<T extends ValueMap> = string & keyof T

export default class<T extends ValueMap> {
	private data: Record<string, any> = {}
	private storageKey: string
	
	constructor(options: Options = {}) {
		
		this.storageKey = options.storageKey || 'storage';
		
		this.load();
	}
	
	private getPrefixedKey(key: string): string {
		return `${this.storageKey}.${key}`;
	}
	
	public set<K extends ValueKey<T>>(name: K, value: T[K]) {
		
		const prefixedKey = this.getPrefixedKey(name);
		
		this.data[name] = value;
		GM_setValue(prefixedKey, value);
	}
	
	public get<K extends ValueKey<T>>(name: K): T[K] | null {
		if (name in this.data) {
			return this.data[name];
		}
		const value = this.data[name];
		if (value !== null) {
			return value;
		}
		
		return null;
	}
	
	public has<K extends ValueKey<T>>(name: K) {
		const prefixedKey = this.getPrefixedKey(name);
		return name in this.data || GM_getValue(prefixedKey, null) !== null;
	}
	
	private load() {
		const keys = GM_listValues();
		keys.forEach(key => {
			if (key.startsWith(`${this.storageKey}.`)) {
				const unprefixedKey = key.substring(this.storageKey.length + 1);
				const value = GM_getValue(key, null);
				if (value !== null) {
					this.data[unprefixedKey] = value;
				}
			}
		});
	}
}