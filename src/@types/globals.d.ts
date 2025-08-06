export {}


type ModifiedWindow = {
	ssv: {
		shard: string
	}
} & Window

declare global {
	var unsafeWindow: ModifiedWindow;
}