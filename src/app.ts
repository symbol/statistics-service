import 'module-alias/register';
import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import * as winston from 'winston';
import * as config from './config';
import { DataBase } from './services/DataBase';
import { NodeMonitor } from './services/NodeMonitor';
import { ChainHeightMonitor } from './services/ChainHeightMonitor';
import { GeolocationMonitor } from './services/GeolocationMonitor';
import { Routes } from './routes';
import { Logger } from './infrastructure';
import * as utils from '@src/utils';

const logger: winston.Logger = Logger.getLogger(utils.basename(__filename));

class App {
	static start = async () => {
		/**
		 * -------------- Initialize App --------------
		 */
		config.verifyConfig(config);
		const app = express();

		/**
		 * -------------- Middleware --------------
		 */
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(cors());
		app.use('/openapi', express.static('openapi'));

		/**
		 * -------------- Start services --------------
		 */
		await DataBase.connect(config.db.MONGODB_ENDPOINT);
		await Routes.register(app);
		(await new NodeMonitor(config.monitor.NODE_MONITOR_SCHEDULE_INTERVAL).init()).start();
		new ChainHeightMonitor(config.monitor.CHAIN_HEIGHT_MONITOR_SCHEDULE_INTERVAL).start();
		new GeolocationMonitor(config.monitor.GEOLOCATION_MONITOR_SCHEDULE_INTERVAL).start();

		/**
		 * -------------- Server listen --------------
		 */
		app.listen(config.network.PORT, () => {
			logger.info(`Server is running on port: ${config.network.PORT}`);
		});
	};
}

App.start();
