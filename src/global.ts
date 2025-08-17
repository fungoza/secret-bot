import Bot from './Bot';
import { GUI } from './GUI';
import Storage from './Storage'
import Template from './Template';
import { ITargeter } from './types';

type CommonStorage = {
	'firstStart': boolean,
	'coords': string,
	'src': string,
    'strat': string,
	'season': number,
	'onlyOnVirgin': boolean
}

export default <{
	storage: Storage<CommonStorage>,
	tempCoords: string,
	gui: GUI,
	bot: Bot,
	template: Template,
	targeter: ITargeter
	extraColorsBitmap: number,
	pixelsData: number[],
	currentToken: string
}>{};