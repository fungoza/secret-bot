import Storage from './Storage'

type CommonStorage = {
	'firstStart': boolean,
	'coords': string,
	'src': string,
    'strat': string,
	'season': number
}

export default <{
	storage: Storage<CommonStorage>,
	tempCoords: string
}>{};