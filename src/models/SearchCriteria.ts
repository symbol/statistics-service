export enum Order {
	Asc = 'asc',
	Desc = 'desc',
}

export interface SearchCriteria {
	pageNumber: number;
	pageSize: number;
	order: Order;
}
