import { IListItem, ListSource, ItemIcon, ItemState, SelectionState } from 'davinci.js';

interface ITreeLayout extends EngineAPI.IGenericBaseLayout {
    qTreeData: EngineAPI.INxTreeNode;
}

interface ISizeHc {
    height: number;
    width: number;
    maxWidth: number;
}

interface IListItemExtended extends IListItem<any> {
    hasChild: boolean;
    rowNumber: number;
    colNumber: number;
    parentNode: number;
    elNumber: number;
    nodeNumber: number;
    parentRowNumber: number;
    measureValue: string;
    isLast: boolean;
    selectionState: string;
}

declare type ListItem =
    | IListItem<EngineAPI.INxCell>
    | IListItem<EngineAPI.INxCell>[];

/** only possible to make it free from listsource is to use a decorator */
export class TreeListSource extends ListSource<EngineAPI.INxCell> {

    private sizeHc: ISizeHc;
    private expandCounter = 0;
    public header: IListItemExtended[] = [];

    /**
     * Creates an instance of GenericListSource.
     */
    public constructor(
        private treeList: EngineAPI.IGenericObject
    ) {
        super();
        this.registerEvents();
    }

    /**
     * deselect one or multiple items on hypercube
     */
    public deselect(item: ListItem) {
    }

    /**
     * select one or multiple items on listobject
     */
    public select(item: IListItemExtended) {
        console.log("ITEM", item)
        this.treeList.selectHyperCubeValues("/qTreeDataDef", item.colNumber , [item.elNumber], false);
    }

    /**
     * get layout from current session object to determine full size
     * of our list
     */
    public async connect() {
        super.connect();
        const data = await this.treeList.getLayout() as any;

        this.sizeHc = this.calculateSizeOfHc((data.qTreeData as any).qNodesOnDim);
        this.dataModel.total = this.sizeHc.height;
    }

    /**
     * search in hypercube, this should interpreted as
     */
    public async search(value: string): Promise<boolean> {
        return;
    }

    /**
     * toggle selection on selected values
     */
    private toggleSelection(item: IListItemExtended) {
    }

    /** load all items for specific page */
    public async load(start: number, count: number): Promise<IListItem<EngineAPI.INxCell>[]> {

        start = start < 0 ? 0 : start;

        const nodes = {
            qAllValues: false,
            qArea: {
                qHeight: count,
                qLeft: 0,
                qTop: start,
                qWidth: this.sizeHc.width
            }
        };

        const rawData: any[] = await (this.treeList as any).getHyperCubeTreeData("/qTreeDataDef", {
            qMaxNbrOfNodes: 10000,
            qTreeLevels: {
                qDepth: -1,
                qLeft: 0
            },
            qTreeNodes: [nodes]
        });

        let data: IListItemExtended[] = [];

        // todo: return header on data object
        this.header = [];

        data = this.calcRenderData(rawData[0].qNodes, data, start);

        console.log("DATA", data);

        return data;
    }

    /** register on changed events on session object */
    private registerEvents() {
        this.treeList.on("changed", async () => {
            const data = await this.treeList.getLayout() as any;
            this.sizeHc = this.calculateSizeOfHc((data.qTreeData as any).qNodesOnDim);
            this.dataModel.total = this.sizeHc.height;
            this.update$.next();
        });
    }

    /**
     * get icon for state
     */
    private getIcon(state: EngineAPI.NxCellStateType): ItemIcon {
        return
    }

    /**
     * get state for item
     */
    private getState(state: EngineAPI.NxCellStateType): ItemState {
        return;
    }

    private calculateSizeOfHc(nodesOnDimension: number[]): ISizeHc {
        let height = 0;
        let width = 0;
        const maxWidth = nodesOnDimension.length;
        for (const count of nodesOnDimension) {
            if (count > 0) {
                width++;
                height = count + this.expandCounter;
            }
        }
        return {
            height,
            width,
            maxWidth
        };
    }

    private calcRenderData(data: any, calcData: IListItemExtended[], index: number, parrentRowNumber = -1, colNum = -1): IListItemExtended[] {

        const col = colNum + 1;

        for (const rawItem of data) {

            const subNode: IListItemExtended = {
                hasChild: rawItem.qNodes.length > 0 ? true : false,
                label: rawItem.qText,
                rowNumber: rawItem.qRow,
                colNumber: col,
                parentNode: rawItem.qParentNode,
                elNumber: rawItem.qElemNo,
                nodeNumber: rawItem.qNodeNr,
                parentRowNumber: parrentRowNumber,
                measureValue: rawItem.qValues[0].qText,
                raw: rawItem,
                icon: ItemIcon.NONE,
                state: ItemState.NONE,
                selectionState: rawItem.qAttrExps.qValues[1].qText,
                isLast: col === this.sizeHc.maxWidth - 1
            };

            if (rawItem.qRow - (rawItem.qNodes.length > 0 ? 1 : 0) < index) {
                this.header.push(subNode);
            }
            calcData.push(subNode);
            if (rawItem.qNodes.length > 0) {
                calcData = this.calcRenderData(rawItem.qNodes, calcData, rawItem.qRow, colNum, col);
            }
        }
        return calcData;
    }

    public async expandCollapseItem(item: IListItemExtended) {
        if (item.hasChild) {
            this.expandCounter--;
            await this.treeList.collapseLeft("/qTreeDataDef", item.rowNumber, item.colNumber, false);
        } else {
            this.expandCounter++;
            await this.treeList.expandLeft("/qTreeDataDef", item.rowNumber, item.colNumber, false);
        }
    }

    public getHeader() {
        return this.header;
    }
}
