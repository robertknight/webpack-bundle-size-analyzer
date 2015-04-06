/// <reference path="DefinitelyTyped/tsd.d.ts" />

declare module 'filesize' {
	interface SizeObject {
		value: number;
		suffix: string;
	}

	type SizeTuple = [number, string];
	type FilesizeOutput = string | number | SizeObject | SizeTuple;

	interface Options {
		base?: number;
		bits?: boolean;
		exponent?: number;
		output?: string;
		round?: number;
		spacer?: string;
		suffixes?: {[unit: string]: string};
		unix?: boolean;
	}

	function filesize(size: number, opts?: Options): FilesizeOutput;

	export = filesize;
}
