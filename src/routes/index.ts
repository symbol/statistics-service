import { Express, Request, Response } from 'express';
import NodeModel from '@src/DataBase/models/Node';

export class Routes {
    static register = async (app: Express) => {
        app.get('/nodes', async (req: Request, res: Response) => {
            const nodes = await NodeModel.find().exec();
            res.send(nodes);
        });
    }
}