import 'module-alias/register';
import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import * as config from './config';
import { DataBase } from './DataBase';


class App {
    static start = async () => {
        /**
         * -------------- Initialize Express App --------------
         */ 

        const app = express();
        await DataBase.connect();


        /**
         * -------------- Middleware --------------
         */ 
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cors());


        /**
         * -------------- Server listen --------------
         */ 
        app.listen(config.network.PORT, () => {
            console.log(`[App]: Server is running on port: ${config.network.PORT}`);
        });
    }
}

App.start();