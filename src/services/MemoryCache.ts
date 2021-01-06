class MemoryCache {
	store: { [key: string]: any; }
	constructor() {
		this.store = {};
	}

	set = (key: string, value: any) => {
		this.store[key] = value;
	}

	get = (key: string) => {
		return this.store[key];
	}

	delete = (key: string) => {
		delete this.store[key];
	}
}

export const memoryCache = new MemoryCache();