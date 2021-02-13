import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
const REQEST_TIMEOUT = 10000;

export class HTTP {
	static get(url: string, config?: AxiosRequestConfig | undefined): Promise<AxiosResponse<any>> {
		return new Promise<AxiosResponse<any>>((resolve, reject) => {
			setTimeout(() => {
				reject(Error(`HTTP get request failed. Timeout error`));
			}, REQEST_TIMEOUT + REQEST_TIMEOUT * 0.1);

			axios
				.get(url, { timeout: REQEST_TIMEOUT, ...config })
				.then(resolve)
				.catch(reject);
		});
	}
}
