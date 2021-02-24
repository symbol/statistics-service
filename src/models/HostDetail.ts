import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface PeerStatus {
	isAvailable: boolean;
	lastStatusCheck: number;
}

export interface IHostDetail {
	host: string;
	coordinates: Coordinates;
	location: string;
	ip: string;
	organization: string;
	as: string;
	continent: string;
	country: string;
	region: string;
	city: string;
	district: string;
	zip: string;
}

export interface HostDetailDocument extends IHostDetail, Document {}

const HostDetailSchema: Schema = new Schema({
	host: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},
	coordinates: {
		type: {
			latitude: {
				type: Number,
				required: true,
			},
			longitude: {
				type: Number,
				required: true,
			},
		},
		required: false,
	},
	location: {
		type: String,
		required: true,
	},
	ip: {
		type: String,
		required: true,
	},
	organization: {
		type: String,
		required: false,
	},
	as: {
		type: String,
		required: false,
	},
	continent: {
		type: String,
		required: false,
	},
	country: {
		type: String,
		required: false,
	},
	region: {
		type: String,
		required: false,
	},
	city: {
		type: String,
		required: false,
	},
	district: {
		type: String,
		required: false,
	},
	zip: {
		type: String,
		required: false,
	},
});

HostDetailSchema.set('toObject', {
	transform: (doc: Document, ret: Document) => {
		delete ret._id;
		delete ret.__v;
	},
});

export const HostDetail = mongoose.model<HostDetailDocument>('HostDetail', HostDetailSchema);
