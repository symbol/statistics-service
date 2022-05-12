import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { monitor } from '@src/config';

export class HTTP {
	static TIMEOUT_MSG = `HTTP get request failed. Timeout error`;

	static get(url: string, config?: AxiosRequestConfig | undefined): Promise<AxiosResponse<any>> {
		return new Promise<AxiosResponse<any>>((resolve, reject) => {
			const options = { timeout: monitor.REQUEST_TIMEOUT, ...config };
			const timeout = setTimeout(() => {
				reject(Error(HTTP.TIMEOUT_MSG));
			}, options.timeout * 1.1);

			axios
				.get(url, options)
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
