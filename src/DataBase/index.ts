import * as mongoose from 'mongoose';
import * as config from '@src/config';
export * as models from './models';

export class DataBase {
    static connect = async () => {
        try {
            await mongoose.connect(
                config.db.MONGODB_ENDPOINT,
                { useNewUrlParser: true, useUnifiedTopology: true }
            ) 
        }
        catch(err) {
            console.error('[DataBase]: Failed to connect MongoDB');
            throw err;
        }
        console.log('[DataBase]: Connected to MongoDB');
    }
}