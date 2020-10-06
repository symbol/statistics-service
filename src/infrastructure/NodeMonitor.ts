import * as config from '@src/config';
import NodeModel, { INode } from '@src/DataBase/models/Node';

class NodeMonitor {
    private visitedNodes: INode[];
    private nodeList: INode[];
    private currentNodeIndex: number;
    private isRunning: boolean;

    constructor() {
        this.visitedNodes = [];
        this.nodeList = [];
        this.currentNodeIndex = 0;
        this.isRunning = false;
    }

    public start = async () => {
        this.isRunning = true;
        this.clear();

        await this.main();

        if(this.isRunning) {
            await this.updateCollection();
            setTimeout(
                () => this.start(), 
                config.monitor.NODE_MONITOR_SCHEDULE_INTERVAL
            );
        }
    }

    public stop = () => {
        this.isRunning = false;
        this.clear();
    }

    private main = async (): Promise<any> => {
        let isFinished = false;

        if(!this.isRunning)
            return;

        if(isFinished)
            return Promise.resolve();
    }

    private fetchNodeList = async (nodeUrl: string): Promise<Array<INode>> => {
        return [];
    }

    private clear = () => {
        this.visitedNodes = [];
        this.nodeList = [];
        this.currentNodeIndex = 0;
    }

    private updateCollection = async (): Promise<any> => {
        await NodeModel.remove({}).exec();
        await NodeModel.insertMany(this.nodeList);
    }

    private checkAPINode = (nodeUrl: string): Promise<boolean> => {
        return Promise.resolve(true);
    }

    private addNodeToList = (node: INode) => {
        //TODO: replace with MAP
        if(!!this.nodeList.find(addedNode => 
            addedNode.publicKey === node.publicKey
        ))
            return;
        this.nodeList.push(node);
    }

    private removeNodeFromList = (node: INode) => {

    }

    private addNodeToVisited = (node: INode) => {
        this.visitedNodes.push(node);
    }

    private isNodeVisited = (node: INode): boolean => {
        return !!this.visitedNodes.find(visitedNode => 
            visitedNode.publicKey === node.publicKey
        );
    }
}