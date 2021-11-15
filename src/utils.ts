import { Request } from 'express';
import * as _ from 'lodash';
import * as path from 'path';
import { INode } from '@src/models/Node';

export const stringToArray = (str: string | undefined): Array<any> => {
	let result = null;

	try {
		if (typeof str === 'string') result = JSON.parse(str);
	} catch (e) {}
	return result;
};

export const isAPIRole = (roleType: number): boolean => {
	// https://github.com/nemtech/symbol-openapi/blob/2c3daf4ca50e5da43c6ab36706825c9599102b36/spec/core/node/schemas/RolesTypeEnum.yml#L10
	const RolesTypeEnum = [2, 3, 6, 7];

	return !!RolesTypeEnum.find((role) => role === roleType);
};
export const isPeerRole = (roleType: number): boolean => {
	// https://github.com/nemtech/symbol-openapi/blob/2c3daf4ca50e5da43c6ab36706825c9599102b36/spec/core/node/schemas/RolesTypeEnum.yml#L10
	const RolesTypeEnum = [1, 3, 5, 7];

	return !!RolesTypeEnum.find((role) => role === roleType);
};

export const getNodeURL = (node: INode, port: number): string => {
	return `http://${node.host}:${port}`;
};

export const sleep = (ms: number): Promise<any> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const basename = (filename: string) => {
	return path.basename(filename, '.js');
};

export const parseArray = (array: any): Array<any> | null => {
	if (Array.isArray(array)) return array;

	if (typeof array === 'string') {
		try {
			const json = JSON.parse(array);

			if (Array.isArray(json)) return json;
		} catch (e) {
			return null;
		}
	}

	return null;
};

export const splitArray = (array: Array<any>, chunks: number): Array<any> =>
	array.reduce((all, one, i) => {
		const ch = Math.floor(i / chunks);

		all[ch] = [].concat(all[ch] || [], one);
		return all;
	}, []);

export const reqToPageParameters = (req: Request, filterKeys?: Array<string>): { [key: string]: unknown } => {
	const searchCriteria = _.pick(req.query, 'pageNumber', 'pageSize', 'order');
	const filter = _.pick(req.query, filterKeys || []);

	return { ...searchCriteria, ...filter };
};
