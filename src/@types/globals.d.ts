export {}

declare module "*.css" {
  const content: string;
  export default content;
}

type ModifiedWindow = {
	ssv: {
		shard: string
	}
} & Window

declare global {	
	const GM_info: {
		script: {
			version: string,
		}
	} | undefined;

	var globalThis: {
		window: ModifiedWindow
	} & ModifiedWindow;

	var unsafeWindow: ModifiedWindow;
}