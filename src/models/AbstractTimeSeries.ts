import { Document } from 'mongoose';

export interface TimeSeriesValue {
    name: string;
    value: number;
}

export interface AbstractTimeSeries {
	date: Date;
    values: Array<TimeSeriesValue>
}

export interface AbstractTimeSeriesDocument extends AbstractTimeSeries, Document {}