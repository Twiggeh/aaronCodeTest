export type NewData<T> = {
	[K in keyof T as `new${Capitalize<string & K>}`]: T[K];
};
