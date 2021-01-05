import { Request } from 'express';
import { Document, Model } from 'mongoose'

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

export class Pagination {
	public static getPage<T extends Document>(model: Model<T>, req: Request): Promise<T[]> {
		const searchCriteria = Pagination.reqToSearchCriteria(req);
		const pageIndex = searchCriteria.pageNumber - 1;

		return model.find()
			.sort(searchCriteria.order == Order.Desc ? { _id: -1 } : { _id: 1 })
			.limit(searchCriteria.pageSize)
			.skip(searchCriteria.pageSize * pageIndex)
			.exec();
	}

	public static reqToSearchCriteria(req: Request): SearchCriteria {
		const pageNumber =
			parseInt(req.query.pageNumber as string) || 1;
		const pageSize =
			parseInt(req.query.pageSize as string) || 10;
		const order = (req.query.order as Order) || Order.Desc;

		return {
			pageNumber,
			pageSize,
			order
		};
	}
}