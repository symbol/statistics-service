import { Request } from 'express';
import { Document, Model } from 'mongoose';

export enum SortType {
	ASC = 1,
	DESC = -1,
}

export enum Order {
	Asc = 'asc',
	Desc = 'desc',
}

export interface SearchCriteria {
	pageNumber: number;
	pageSize: number;
	order: Order;
}

export interface PaginationResponse<T> {
	pageSize: number;
	pageNumber: number;
	lastPageNumber?: number;
	data: T[];
}

export class PaginationResponse<T> implements PaginationResponse<T> {
	data: T[];
	pageSize: number;
	pageNumber: number;
	lastPageNumber?: number;

	constructor(data: T[], searchCriteria: SearchCriteria, recordsCount?: number) {
		this.data = data;
		this.pageSize = searchCriteria.pageSize;
		this.pageNumber = searchCriteria.pageNumber;
		if (recordsCount) this.lastPageNumber = Math.ceil(recordsCount / searchCriteria.pageSize);
	}
}

export class Pagination {
	public static async getPage<T extends Document>(model: Model<T>, searchCriteria: SearchCriteria): Promise<PaginationResponse<T>> {
		const pageIndex = searchCriteria.pageNumber - 1;
		const data = await model
			.find()
			.sort(searchCriteria.order == Order.Desc ? { _id: -1 } : { _id: 1 })
			.limit(searchCriteria.pageSize)
			.skip(searchCriteria.pageSize * pageIndex)
			.exec();

		return new PaginationResponse<T>(data, searchCriteria);
	}

	public static reqToSearchCriteria(req: Request): SearchCriteria {
		const pageNumber = parseInt(req.query.pageNumber as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 10;
		const order = (req.query.order as Order) || Order.Desc;

		return {
			pageNumber,
			pageSize,
			order,
		};
	}
}
