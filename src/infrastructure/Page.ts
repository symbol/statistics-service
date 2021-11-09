import { Order, SearchCriteria } from '@src/models/SearchCriteria';
import { Document, Model, Query } from 'mongoose';

export interface Pagination {
	pageSize: number;
	pageNumber: number;
}

export interface IPage<R> {
	data: R[];
	pagination: Pagination;
}

export interface Parameters {
	pageNumber?: string | number;
	pageSize?: string | number;
	order?: string;
	[key: string]: unknown;
}

/**
 * @template T Data item type. Document of the collection
 * @template R Data item type. Result type of formatData() function
 */
export class Page<T extends Document, R> implements IPage<R> {
	data: R[];
	pagination: Pagination;
	private query: Query<T[], T>;
	private formatData: (data: T[]) => Array<R>;
	private formatFilter: (parameters: Parameters) => Record<string, unknown>;

	constructor(
		parameters: Parameters,
		model: Model<T>,
		formatData: (data: T[]) => Array<R>,
		formatFilter: (parameters: Parameters) => Record<string, unknown> = (
			_,
		) => _,
	) {
		this.formatData = formatData;
		this.formatFilter = formatFilter;
		const searchCriteria = this.parametersToSearchCriteria(parameters);
		const filter = this.parametersToFilter(parameters);
		const pageIndex = searchCriteria.pageNumber - 1;
		this.pagination = {
			pageSize: searchCriteria.pageSize,
			pageNumber: searchCriteria.pageNumber,
		};
		this.data = [];
		this.query = model
			.find(filter as any)
			.sort(searchCriteria.order == Order.Desc ? { _id: -1 } : { _id: 1 })
			.limit(searchCriteria.pageSize)
			.skip(searchCriteria.pageSize * pageIndex);
	}

	async exec(): Promise<Page<T, R>> {
		const data = await this.query.exec();
		this.data = this.formatData(data);
		return this;
	}

	toJSON(): string {
		return JSON.stringify(this.toObject());
	}

	toObject(): IPage<R> {
		return {
			data: this.data,
			pagination: this.pagination,
		};
	}

	private parametersToSearchCriteria(parameters: Parameters): SearchCriteria {
		const pageNumber = parseInt(parameters.pageNumber as string) || 1;
		const pageSize = parseInt(parameters.pageSize as string) || 10;
		const order = (parameters.order as Order) || Order.Desc;

		return {
			pageNumber,
			pageSize,
			order,
		};
	}

	private parametersToFilter(
		parameters: Parameters,
	): Record<string, unknown> {
		const { pageNumber, pageSize, order, ...rest } = parameters;
		const filter = this.formatFilter({ ...rest });
		return filter;
	}
}
