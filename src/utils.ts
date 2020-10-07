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
