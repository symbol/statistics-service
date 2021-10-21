import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { monitor } from '@src/config';

const REQEST_TIMEOUT = monitor.REQUEST_TIMEOUT;

export class HTTP {
	static get(url: string, config?: AxiosRequestConfig | undefined): Promise<AxiosResponse<any>> {
		return new Promise<AxiosResponse<any>>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(Error(`HTTP get request failed. Timeout error`));
			}, REQEST_TIMEOUT + REQEST_TIMEOUT * 0.1);

			axios
				.get(url, { timeout: REQEST_TIMEOUT, ...config })
				.then((response) => {
					clearTimeout(timeout);
					resolve(response);
				})
				.catch((e) => {
					clearTimeout(timeout);
					reject(e);
				});
		});
	}
}
