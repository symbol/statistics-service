import 'module-alias/register';
import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import * as config from './config';
import { DataBase } from './DataBase';
import { Routes } from './routes';
import { NodeMonitor } from './infrastructure/NodeMonitor';

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

		/**
		 * -------------- Start services --------------
		 */
		await DataBase.connect(config.db.MONGODB_ENDPOINT);
		await Routes.register(app);
		new NodeMonitor(config.monitor.NODE_MONITOR_SCHEDULE_INTERVAL).start();

		/**
		 * -------------- Server listen --------------
		 */
		app.listen(config.network.PORT, () => {
			console.log(`[App]: Server is running on port: ${config.network.PORT}`);
		});
	};
}

App.start();
