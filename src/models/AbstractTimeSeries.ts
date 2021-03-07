import { Document } from 'mongoose';

export interface TimeSeriesValues {
	[key: string]: number;
}

export interface AbstractTimeSeries {
	date: Date;
	values: TimeSeriesValues;
}

export interface AbstractTimeSeriesDocument extends AbstractTimeSeries, Document {}
