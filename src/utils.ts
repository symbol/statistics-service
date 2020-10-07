export const stringToArray = (str: string | undefined): Array<any> => {
	let result = null;

	try {
		if (typeof str === 'string') result = JSON.parse(str);
	} catch (e) {}
	return result;
};
