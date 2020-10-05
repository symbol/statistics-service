class NodeMonitor {
    private visitedNodes: string[];
    private nodeList: string[];
    private currentNodeIndex: number;

    constructor() {
        this.visitedNodes = [];
        this.nodeList = [];
        this.currentNodeIndex = 0;
    }

    public start = () => {
        this.clear();
    }

    public stop = () => {
        this.clear();
    }

    private clear = () => {
        this.visitedNodes = [];
        this.nodeList = [];
        this.currentNodeIndex = 0;
    }

    private updateCollection = () => {

    }

    private checkAPINode = (nodeUrl: string): Promise<boolean> => {
        return Promise.resolve(true);
    }

    private addNodeToList = (nodeUrl: string) => {

    }

    private removeNodeFromList = (nodeUrl: string) => {

    }

    private addNodeToVisited = (nodeUrl: string) => {

    }


}