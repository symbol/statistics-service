import { Document, Model, Query } from 'mongoose';
import { AbstractTimeSeries, AbstractTimeSeriesDocument, TimeSeriesValue } from '@src/models/AbstractTimeSeries';
import { Logger } from '@src/infrastructure';
import { basename } from '@src/utils';

const logger = Logger.getLogger(basename(__filename));
const ERROR_REPEATE_TIMEOUT = 5000;
type AggreagateType = 'average' | 'accumulate';

export class TimeSeriesService<T extends AbstractTimeSeries, D extends AbstractTimeSeriesDocument> {
    private dayCollection: Array<T>;
    // private mainCollection: Array<T>;
    private aggregateType: AggreagateType;
    private dayModel: Model<D>;
    private mainModel: Model<D>;
    private lastMainCollectionDocument: D | null;
    

    constructor(
        aggregateType: AggreagateType,
        dayModel: Model<D>,
        mainModel: Model<D>
    ) {
        this.aggregateType = aggregateType;
        this.dayModel = dayModel;
        this.mainModel = mainModel;
        this.dayCollection = [];
        this.lastMainCollectionDocument = null;
        this.getDayCollection();
        //this.getLastMainCollectionDocument();
    }

    public async setData(data: T) {
        console.log('==========> setData', data)
        console.log('==========> this.dayCollection', this.dayCollection)
        if (this.shouldMainCollectionBeUpdated(data)) {
            console.log('==========> setData.shouldMainCollectionBeUpdated(true)')
            const date = this.dayCollection[this.dayCollection.length - 1].date;
            let sum: Array<TimeSeriesValue> = [];
            let mainData: Array<TimeSeriesValue> = [];
            

            for(let docIndex = 0; docIndex < this.dayCollection.length; docIndex++) {
                for(let valueIndex = 0; valueIndex < this.dayCollection[docIndex].values.length; valueIndex++) {
                    if (!sum[valueIndex]) {
                        sum[valueIndex] = {
                            name: this.dayCollection[docIndex].values[valueIndex].name,
                            value: 0
                        }
                    }
                    
                    sum[valueIndex].value = sum[valueIndex].value += this.dayCollection[docIndex].values[valueIndex].value;
                }
            }

            if (this.aggregateType === 'average') {
                mainData = sum.map(el => ({
                    ...el,
                    value: el.value / this.dayCollection.length
                }));
            }
            else {
                mainData = sum;
            }

            const mainDocument = {
                date,
                values: mainData
            }

            console.log('==========> setData.mainDocument', mainDocument)

            await this.insertToMainCollection(mainDocument as T);
            await this.clearDayCollection();
        }
        else {
            console.log('==========> setData.shouldMainCollectionBeUpdated(false)');
            await this.insertToDayCollection(data);
            this.dayCollection.push(data);
        }
    }

    private shouldMainCollectionBeUpdated(data: T) {
        // if (this.lastMainCollectionDocument) {
        //     return this.isDayEnded(
        //         this.lastMainCollectionDocument.date,
        //         data.date
        //     );
        // }

        if (this.dayCollection.length) {
            return this.isDayEnded(
                this.dayCollection[this.dayCollection.length - 1].date,
                data.date
            );
        }

        return false;
    }

    private isDayEnded(currentDate: Date, date: Date) {
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        const minutes = date.getUTCMinutes();
        
        const currentDay = currentDate.getUTCDate();
        const currentMonth = currentDate.getUTCMonth() + 1;
        const currentYear = currentDate.getUTCFullYear();
        const currentMinutes = currentDate.getUTCMinutes();

        console.log(`minutes(${minutes}) > currentMinutes(${currentMinutes})`)
        if (year > currentYear) return true;
        if (year === currentYear && month > currentMonth) return true;
        if (year === currentYear && month === currentMonth && day > currentDay)  return true;
        if (minutes > currentMinutes)  return true;

        return false;
    }

    private async insertToDayCollection(data: T) {
        const document = new this.dayModel(data);
        const collection = document.collection;
		try {
			await document.save();
			logger.info(
				`insertToDayCollection. Document has been inserted into ${collection.name}`,
			);
		} catch (e) {
			logger.error(
				`insertToDayCollection. Document could not be saved into ${collection.name}. Error: ${e.message}`,
			);
			logger.error(e);
		}
    }

    private async insertToMainCollection(data: T) {
        const document = new this.mainModel(data);
        const collection = document.collection;
		try {
			await document.save();
			logger.info(
				`insertToMainCollection. Document has been inserted into ${collection.name}`,
			);
		} catch (e) {
			logger.error(
				`insertToMainCollection. Document could not be saved into ${collection.name}. Error: ${e.message}`,
			);
			logger.error(e);
		}
    }

    private async getDayCollection() {
        try {
            const dayCollection = await this.dayModel
                .find()
                .exec();

            this.dayCollection = dayCollection.map(el => ({
                date: el.date,
                values: el.values
            }) as T);
        }
        catch(e) {
            logger.error(
				`Failed getDayCollection. Error: ${e.message}`,
			);
            await new Promise(resolve => setTimeout(() => {
                this.getDayCollection()
                    .then(() => resolve(null));
            }, ERROR_REPEATE_TIMEOUT));
        }
    }

    private async getLastMainCollectionDocument() {
        try {
            const mainCollection = await this.mainModel
                .find()
                .sort({ _id: -1 })
                .limit(1)
                .exec();

            this.lastMainCollectionDocument = mainCollection[0];
        }
        catch(e) {
            logger.error(
				`Failed getLastMainCollectionDocument. Error: ${e.message}`,
			);
            await new Promise(resolve => setTimeout(() => {
                this.getLastMainCollectionDocument()
                    .then(() => resolve(null));
            }, ERROR_REPEATE_TIMEOUT));
        }
    }

    private async clearDayCollection() {
        try {
            await this.dayModel.deleteMany();
            this.dayCollection = [];
        }
        catch(e) {
            logger.error(
				`Failed clearDayCollection. Error: ${e.message}`,
			);
            await new Promise(resolve => setTimeout(() => {
                this.clearDayCollection()
                    .then(() => resolve(null));
            }, ERROR_REPEATE_TIMEOUT));
        }
    }
}