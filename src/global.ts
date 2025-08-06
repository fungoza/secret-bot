import Bot from './Bot';
import { GUI } from './GUI';
import Storage from './Storage'
import Template from './Template';

type CommonStorage = {
	'firstStart': boolean,
	'coords': string,
	'src': string,
    'strat': string,
	'season': number
}

export default <{
	storage: Storage<CommonStorage>,
	tempCoords: string,
	gui: GUI,
	bot: Bot,
	template: Template
}>{};