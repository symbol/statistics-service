import { HTTP } from '@src/services/Http';
import { expect } from 'chai';
import { stub } from 'sinon';
import axios from 'axios';

describe('Http', () => {
	it('Get method timeouts after given time', async () => {
		// Arrange:
		stub(axios, 'get').returns(
			new Promise((_, reject) => {
				setTimeout(() => {
					reject(Error('timeout'));
				}, 5_000);
			}),
		);

		// Act:
		try {
			await HTTP.get('SOME_FAKE_URL', { timeout: 2_000 });
		} catch (err: any) {
			// Assert:
			expect(err.message).to.be.equal(HTTP.TIMEOUT_MSG);
		}
	}).timeout(3000);
});
