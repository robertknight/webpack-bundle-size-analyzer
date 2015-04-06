export type Milliseconds = number;
export type Bytes = number;
export type Path = string;

export interface WebpackAsset {
	name: string;
	size: Bytes;
	chunks: number[];
	chunkNames: string[];
	emitted: boolean;
}

export interface WebpackChunk {
	// TODO
}

export interface WebpackModule {
	id: number;
	identifier: Path;
	name: string;
	size: Bytes;
}

export interface WebpackJsonOutput {
	version: string;
	hash: string;
	time: Milliseconds;
	assetsByChunkName: {[chunkName: string]: string};
	assets: WebpackAsset[];
	chunks: WebpackChunk[];
	modules: WebpackModule[];
}

