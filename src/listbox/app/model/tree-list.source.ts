import { IListItem, ListSource, ItemIcon, ItemState, SelectionState } from "davinci.js";
import { HypercubeListSource } from "./hypercube-list.source";
import { SessionPropertiesFactory } from "../services/session-properties.factory";
import { isNull } from "util";

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
    assistQRow?: number;
}

declare type ListItem =
    | IListItem<EngineAPI.INxCell>
    | IListItem<EngineAPI.INxCell>[];

/** only possible to make it free from listsource is to use a decorator */
export class TreeListSource extends HypercubeListSource<EngineAPI.INxCell> {

    private sizeHc: ISizeHc;
    private expandCounter = 0;
    private treeLayout;
    private selections: number[] = [];
    private selectedNodes: {label: string, col: number}[] = [];
    private expandedNodes: IListItemExtended[] = [];
    private calcCounter = -1;

    inSelect = false;

    public header: IListItemExtended[] = [];

    /**
     * Creates an instance of GenericListSource.
     */
    public constructor(
        private sessPropFactory: SessionPropertiesFactory,
        private treeList: EngineAPI.IGenericObject,
    ) {
        super();
        this.registerEvents();
    }

    /**
     * select one or multiple items on listobject
     */
    public async select(item: IListItemExtended) {

        if (!this.inSelect) {
            await this.treeList.beginSelections(["/qTreeDataDef"]);
            this.selectedNodes = [];
        }

        if (this.selectedNodes.length > 0) {


            let isSelected = false;
            let pos: number;

            for (let i = 0; i < this.selectedNodes.length; i++) {
                const element = this.selectedNodes[i];

                if (element.col === item.colNumber && element.label === item.label) {
                    isSelected = true;
                    pos = i;
                }

            }

            if (isSelected) {
                this.selectedNodes.splice(pos, 1);
            } else {
                this.selectedNodes.push({label: item.label, col: item.colNumber});
            }
        } else {
            this.selectedNodes.push({label: item.label, col: item.colNumber});
        }

        this.inSelect = true;
        this.treeList.selectHyperCubeValues("/qTreeDataDef", item.colNumber , [item.elNumber], true);
    }

    /**
     * get layout from current session object to determine full size
     * of our list
     */
    public async connect() {
        super.connect();
        const data = await this.treeList.getLayout() as any;
        this.treeLayout = data;

        this.sizeHc = this.calculateSizeOfHc((data.qTreeData as any).qNodesOnDim);
        this.dataModel.total = this.sizeHc.height;

    }

    /**
     * search in hypercube, this should interpreted as
     */
    public async search(value: string): Promise<boolean> {
        return;
    }

    /** load all items for specific page */
    public async load(start: number, count: number): Promise<IListItem<EngineAPI.INxCell>[]> {

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
        this.calcCounter = -1;

        data = this.calcRenderData(rawData[0].qNodes, data, start);

        data[0].assistQRow = data[0].rowNumber;
        for (let i = 1; i < data.length; i++) {
            data[i].assistQRow = data[i - 1].assistQRow + 1;
        }

        return data;
    }

    /** register on changed events on session object */
    private registerEvents() {
        this.treeList.on("changed", async () => {
            const data = await this.treeList.getLayout() as any;

            this.selections = [];
            let counter = 0;
            for (const dimension of data.qTreeData.qDimensionInfo) {
                if (dimension.qStateCounts.qSelected > 0) {
                    this.selections.push(counter);
                }
                counter ++;
            }

            this.sizeHc = this.calculateSizeOfHc((data.qTreeData as any).qNodesOnDim);
            this.dataModel.total = this.sizeHc.height;
            this.update$.next();
        });
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

    private calcRenderData(
        data: any, calcData: IListItemExtended[],
        index: number, parrentRowNumber = -1, colNum = -1
    ): IListItemExtended[] {
        this.calcCounter++;
        const col = colNum + 1;



        for (const rawItem of data) {

            const state = rawItem.qAttrExps.qValues[1].qText;
            const dim = this.treeLayout.qTreeData.qDimensionInfo[col].qGroupFieldDefs[0];
            let isSelect = this.selections.indexOf(col) > -1;
            if (isSelect) {
                isSelect = true;

                if (this.inSelect) {
                    const filtered = this.selectedNodes.filter((value) => {
                        if (value.label === rawItem.qText) {
                            return true;
                        }
                    });

                    if (filtered.length === 0) {
                        isSelect = false;
                    }
                }
            }
            const a = isSelect && state === "ON" ? "S" : state;

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
                selectionState: a,
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

    private removeExpandNode(item: IListItemExtended): void {

        for (let i = 0; i < this.expandedNodes.length; i++) {
            const node = this.expandedNodes[i];
            if (node.label === item.label && node.rowNumber === item.rowNumber) {
                this.expandedNodes.slice(i, 1);
            }
        }
    }

    public async expandCollapseItem(item: IListItemExtended) {

        if (this.inSelect) {
            await this.treeList.endSelections(true);
        }

        if (item.hasChild) {
            this.expandCounter--;
            this.removeExpandNode(item);
            await this.treeList.collapseLeft("/qTreeDataDef", item.rowNumber, item.colNumber, false);
        } else {
            this.expandCounter++;
            this.expandedNodes.push(item);
            await this.treeList.expandLeft("/qTreeDataDef", item.rowNumber, item.colNumber, false);
        }

        if (this.inSelect) {
            await this.treeList.beginSelections(["/qTreeDataDef"]);
        }

    }

    public getHeader() {
        return this.header;
    }

    public scrollTo(item: IListItemExtended) {

        for (const node of this.expandedNodes) {
            if (node.colNumber === item.colNumber && node.label === item.label) {
                return node.rowNumber;
            }
        }

    }

    public acceptSelection() {
        this.inSelect = false;
        return this.treeList.endSelections(true);
    }

    public cancelSelection() {
        this.inSelect = false;
        return this.treeList.endSelections(false);
    }
}
