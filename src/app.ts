import * as express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as cors from 'cors';
import { network } from './config';


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
app.listen(network.PORT, (err: any) => {
    if (err) {
        console.error('[App]: Error starting server', err);
        return;
    }
    console.log(`[App]: Server is running on port: ${network.PORT}`);
});
