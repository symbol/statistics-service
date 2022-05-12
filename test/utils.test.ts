import { expect } from 'chai';
import { promiseAllTimeout, basename } from '@src/utils';
import { Logger } from '@src/infrastructure';
import * as winston from 'winston';

describe('promiseAllTimeout', () => {
	const logger: winston.Logger = Logger.getLogger(basename(__filename));

	const timeoutPromise = (value: string, timeout: number) =>
		new Promise((resolve, _) => {
			setTimeout(() => resolve(value), timeout);
		});
	const promise = (value: string) => Promise.resolve(value);

	it('no timeouts, all resolve', async () => {
		// Arrange:
		const promises = [timeoutPromise('promise 1', 1_000), promise('promise 2')];

		// Act:
		const [result1, result2] = await promiseAllTimeout(promises, 2_000, logger, 'test', 'timeout');

		// Assert:
		expect(result1).to.be.equal('promise 1');
		expect(result2).to.be.equal('promise 2');
	}).timeout(3000);

	it('one of the promises timeouts after given time', async () => {
		// Arrange:
		const promises = [timeoutPromise('promise 1', 2_000), promise('promise 2')];

		// Act:
		const [result1, result2] = await promiseAllTimeout(promises, 1_000, logger, 'test', 'timeout');

		// Assert:
		expect(result1).to.be.equal('timeout');
		expect(result2).to.be.equal('promise 2');
	}).timeout(3000);

	it('all timeout after given time', async () => {
		// Arrange:
		const promises = [timeoutPromise('promise 1', 2_000), timeoutPromise('promise 2', 2_000)];

		// Act:
		const [result1, result2] = await promiseAllTimeout(promises, 1_000, logger, 'test', 'timeout');

		// Assert:
		expect(result1).to.be.equal('timeout');
		expect(result2).to.be.equal('timeout');
	}).timeout(3000);
});
