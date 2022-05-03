import { HTTP } from '@src/services/Http';
import { use, expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { stub, restore } from 'sinon';
import axios from 'axios';

use(chaiAsPromised);

describe('Http', () => {
	afterEach(() => {
		restore();
	});

	it('Get method timeouts after given time', async () => {
		// Arrange:
		stub(axios, 'get').returns(
			new Promise((resolve) => {
				setTimeout(() => {
					resolve('success');
				}, 5_000);
			}),
		);

		// Act + Assert:
		return expect(HTTP.get('SOME_FAKE_URL', { timeout: 2_000 })).to.eventually.be.rejectedWith(HTTP.TIMEOUT_MSG);
	}).timeout(3000);

	it('Get method returns data successfully', async () => {
		// Arrange:
		stub(axios, 'get').returns(
			new Promise((resolve, _) => {
				setTimeout(() => {
					resolve('success');
				}, 1_000);
			}),
		);

		// Act + Assert:
		return expect(HTTP.get('SOME_FAKE_URL', { timeout: 2_000 })).to.eventually.be.equal('success');
	});
});
