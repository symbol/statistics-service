import { Express, Request, Response } from 'express';

export class Routes {
    static register = async (app: Express) => {
        app.get('/nodes', (req: Request, res: Response) => {
            res.send('/nodes');
        });
    }
}