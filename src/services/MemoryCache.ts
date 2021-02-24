class MemoryCache {
	store: { [key: string]: any };
	constructor() {
		this.store = {};
	}

	set = (key: string, value: any) => {
		this.store[key] = value;
	};

	setArray = (key: string, value: Array<any>, indexes?: Array<string>) => {
		this.store[key] = value;
		this.store[key + 'Indexes'] = {};
		indexes?.forEach((index) => {
			this.store[key + 'Indexes'][index] = {};
			value.forEach((item) => (this.store[key + 'Indexes'][index][item[index]] = item));
		});
	};

	get = (key: string) => {
		return this.store[key];
	};

	delete = (key: string) => {
		delete this.store[key];
	};
}

export const memoryCache = new MemoryCache();
