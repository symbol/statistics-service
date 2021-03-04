import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { AbstractTimeSeriesDocument } from '@src/models/AbstractTimeSeries';

const schema: Schema = new Schema({
	date: {
		type: Date,
		required: true,
	},
	values: [
		{
			name: String,
			value: Number,
		},
	],
});

export const NodeCountSeries = mongoose.model<AbstractTimeSeriesDocument>('NodeCountSeries', schema);
export const NodeCountSeriesDay = mongoose.model<AbstractTimeSeriesDocument>('NodeCountSeriesDay', schema);
