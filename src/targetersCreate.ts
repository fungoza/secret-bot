import SortingTargeter from "./SortingTargeter";
import strategies from "./strategies";
import Template from "./Template";
import { BasicTargeterBuilder, SortingFunc } from "./types";

export const basicTargeters: Record<string, BasicTargeterBuilder> = {};
for(const name in strategies) {
	basicTargeters[name] = (tmp: Template) => new SortingTargeter(tmp, strategies[name]);
}

export const createBasicTargeter = (tmp: Template, strategy: string | SortingFunc) => {
	if(typeof strategy === 'string') {
		if(strategy in basicTargeters) {
			return basicTargeters[strategy](tmp);
		} else {
			return undefined;
		}
	}

	return new SortingTargeter(tmp, strategy);
}