import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import * as config from './config';


/**
 * -------------- Initialize Express App --------------
 */ 

const app = express();


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
