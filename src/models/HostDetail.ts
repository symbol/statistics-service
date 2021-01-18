import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

export interface Coordinates {
	latitude: number;
	longitude: number;
};

export interface PeerStatus {
	isAvailable: boolean;
	lastStatusCheck: number;
};

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
};

export interface HostDetailDocument extends IHostDetail, Document {}

const HostDetailSchema: Schema = new Schema({
	host: {
		type: String,
		required: true,
		unique: true,
		index: true
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
		required: true,
	},
	as: {
		type: String,
		required: true,
	},
	continent: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	region: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	district: {
		type: String,
		required: true,
	},
	zip: {
		type: String,
		required: true
	}
});

HostDetailSchema.set('toObject', {
	transform: (doc: Document, ret: Document) => {
		delete ret._id
		delete ret.__v
	}
});

export const HostDetail = mongoose.model<HostDetailDocument>('HostDetail', HostDetailSchema);
