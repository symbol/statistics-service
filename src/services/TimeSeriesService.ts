import { Model } from 'mongoose';
import { AbstractTimeSeries, AbstractTimeSeriesDocument, TimeSeriesValues } from '@src/models/AbstractTimeSeries';
import { Logger } from '@src/infrastructure';
import { basename } from '@src/utils';

const logger = Logger.getLogger(basename(__filename));
const ERROR_REPEATE_TIMEOUT = 5000;

type AggreagateType = 'average' | 'accumulate';

export class TimeSeriesService<T extends AbstractTimeSeries, D extends AbstractTimeSeriesDocument> {
	private dayCollection: Array<T>;
	private aggregateType: AggreagateType;
	private dayModel: Model<D>;
	private mainModel: Model<D>;

	constructor(aggregateType: AggreagateType, dayModel: Model<D>, mainModel: Model<D>) {
		this.aggregateType = aggregateType;
		this.dayModel = dayModel;
		this.mainModel = mainModel;
		this.dayCollection = [];
		this.getDayCollection();
	}

	public async setData(data: T) {
		if (this.shouldMainCollectionBeUpdated(data)) {
			const date = this.dayCollection[this.dayCollection.length - 1].date;
			let sum: TimeSeriesValues = {};
			let mainDocumentValues: TimeSeriesValues = {};

			for (let docIndex = 0; docIndex < this.dayCollection.length; docIndex++) {
				for (let key of Object.keys(this.dayCollection[docIndex].values)) {
					if (!sum[key]) {
						sum[key] = 0
					}

					sum[key] = sum[key] += this.dayCollection[docIndex].values[key];
				}
			}

			if (this.aggregateType === 'average') {
				for(const key of Object.keys(sum)) {
					mainDocumentValues[key] = sum[key] / this.dayCollection.length;
				}
			} else mainDocumentValues = sum;

			const mainDocument = {
				date,
				values: mainDocumentValues,
			};

			await this.insertToMainCollection(mainDocument as T);
			await this.clearDayCollection();
		}

		await this.insertToDayCollection(data);
		this.dayCollection.push(data);
	}

	private shouldMainCollectionBeUpdated(data: T) {
		if (this.dayCollection.length) return this.isDayEnded(this.dayCollection[this.dayCollection.length - 1].date, data.date);

		return false;
	}

	private isDayEnded(currentDate: Date, date: Date) {
		const day = date.getUTCDate();
		const month = date.getUTCMonth() + 1;
		const year = date.getUTCFullYear();
		const minute = date.getUTCMinutes();

		const currentDay = currentDate.getUTCDate();
		const currentMonth = currentDate.getUTCMonth() + 1;
		const currentYear = currentDate.getUTCFullYear();
		const currentMinute = currentDate.getUTCMinutes();
		console.log(minute + '=========>' + currentMinute)

		if (year > currentYear) return true;
		if (year === currentYear && month > currentMonth) return true;
		if (year === currentYear && month === currentMonth && day > currentDay) return true;
		if (minute > currentMinute) return true;

		return false;
	}

	private async insertToDayCollection(data: T) {
		const document = new this.dayModel(data);
		const collection = document.collection;

		try {
			await document.save();
			logger.info(`insertToDayCollection. Document has been inserted into ${collection.name}`);
		} catch (e) {
			logger.error(`insertToDayCollection. Document could not be saved into ${collection.name}. Error: ${e.message}`);
			logger.error(e);
		}
	}

	private async insertToMainCollection(data: T) {
		const document = new this.mainModel(data);
		const collection = document.collection;

		try {
			await document.save();
			logger.info(`insertToMainCollection. Document has been inserted into ${collection.name}`);
		} catch (e) {
			logger.error(`insertToMainCollection. Document could not be saved into ${collection.name}. Error: ${e.message}`);
			logger.error(e);
		}
	}

	private async getDayCollection() {
		try {
			const dayCollection = await this.dayModel.find().exec();

			this.dayCollection = dayCollection.map(
				(el) =>
					({
						date: el.date,
						values: el.values,
					} as T),
			);
		} catch (e) {
			logger.error(`Failed getDayCollection. Error: ${e.message}`);
			await new Promise((resolve) =>
				setTimeout(() => {
					this.getDayCollection().then(() => resolve(null));
				}, ERROR_REPEATE_TIMEOUT),
			);
		}
	}

	private async clearDayCollection() {
		try {
			await this.dayModel.deleteMany();
			this.dayCollection = [];
		} catch (e) {
			logger.error(`Failed clearDayCollection. Error: ${e.message}`);
			await new Promise((resolve) =>
				setTimeout(() => {
					this.clearDayCollection().then(() => resolve(null));
				}, ERROR_REPEATE_TIMEOUT),
			);
		}
	}

	public clear() {
		this.clearDayCollection();
		this.mainModel.deleteMany();
	}
}
