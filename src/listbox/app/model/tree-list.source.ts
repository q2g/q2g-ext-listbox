import { IListItem, ItemIcon, ItemState, SelectionState } from "davinci.js";
import { HypercubeListSource } from "./hypercube-list.source";
import { IExpansionHc } from "../api/expansionHc.interface";
import { IListItemExtended } from "../api/listItemExtended.interface";

export class TreeListSource extends HypercubeListSource<EngineAPI.INxCell> {

    public inSelect = false;
    public header: IListItemExtended[] = [];

    private expansionHc: IExpansionHc;
    private expandCounter = 0;
    private selectedNodes: { lable: string, col: number }[] = [];
    private expandedNodes: { item: IListItemExtended, path: any }[] = [];
    private selectionIndexes: number[] = [];
    private rawData: any[];
    private midData: IListItemExtended[] = [];


    /**
     * Creates an instance of GenericListSource.
     */
    public constructor(
        private treeList: EngineAPI.IGenericObject,
    ) {
        super();
        this.registerEvents();
    }

    //#region public functions

    /**
     * get layout from current session object to determine full size of our list
     */
    public async connect(): Promise<void> {
        super.connect();
        const data = await this.treeList.getLayout() as any;
        this.expansionHc = this.calculateSizeOfHc((data.qTreeData as any).qNodesOnDim);
        this.dataModel.total = this.expansionHc.height;
        return;
    }

    /**
     * load all items for specific page
     * @param start start index of the page
     * @param count row count of the page
     */
    public async load(start: number, count: number): Promise<IListItem<EngineAPI.INxCell>[]> {

        const nodes = {
            qAllValues: false,
            qArea: {
                qHeight: count,
                qLeft: 0,
                qTop: start,
                qWidth: this.expansionHc.width
            }
        };

        this.rawData = await (this.treeList as any).getHyperCubeTreeData("/qTreeDataDef", {
            qMaxNbrOfNodes: 10000,
            qTreeLevels: {
                qDepth: -1,
                qLeft: 0
            },
            qTreeNodes: [nodes]
        });

        // todo: return header on data object
        this.header = [];

        this.midData = [];
        this.midData = this.calcRenderData(this.rawData[0].qNodes, this.midData, start);

        this.midData[0].assistQRow = this.midData[0].rowNumber;
        for (let i = 1; i < this.midData.length; i++) {
            this.midData[i].assistQRow = this.midData[i - 1].assistQRow + 1;
        }

        return this.midData;
    }

    /**
     * cancel qlik selection and end selection mode
     */
    public async cancelSelection(): Promise<void> {
        this.inSelect = false;
        return this.treeList.endSelections(false);
    }

    /**
     * accept qlik selection and end selection mode
     */
    public async acceptSelection(): Promise<void> {
        this.inSelect = false;
        return this.treeList.endSelections(true);
    }

    /**
     * expand or collapse node
     * @param item list item to be collapsed or extended
     */
    public async expandCollapseItem(item: IListItemExtended): Promise<void> {

        if (this.inSelect) {
            await this.treeList.endSelections(true);
        }

        if (item.hasChild) {
            this.expandCounter--;
            this.removeExpandNode(item);
            await this.treeList.collapseLeft("/qTreeDataDef", item.rowNumber, item.colNumber, false);
        } else {
            this.expandCounter++;
            let parrentNodeInfo;

            for (const i of this.midData) {
                if (i.nodeNumber === item.parentNode) {
                    parrentNodeInfo = {
                        colNum: i.colNumber,
                        label: i.label
                    };
                }
            }

            let path;

            for (const i of this.expandedNodes) {
                if (i.item.colNumber === parrentNodeInfo.colNum && i.item.label === parrentNodeInfo.label) {
                    path = i.path;
                }
            }

            if (path) {
                const data = await (this.treeList as any).getHyperCubeTreeData("/qTreeDataDef", path);

                const a = {
                    MaxNbrOfNodes: 10000,
                    qTreeLevels: {
                        qDepth: -1,
                        qLeft: item.colNumber + 1
                    },
                    qTreeNodes: JSON.parse(JSON.stringify(path.qTreeNodes))
                };

                a.qTreeNodes[a.qTreeNodes.length - 1].qArea.qTop = item.rowNumber - data[0].qNodes[0].qRow;
                a.qTreeNodes.push({
                    qAllValues: false,
                    qArea: {
                        qHeight: 1,
                        qLeft: item.colNumber + 1,
                        qTop: 0,
                        qWidth: 1
                    }
                });

                this.expandedNodes.push({ item, path: a });

            } else {

                const nodes = [];

                for (let i = 0; i <= item.colNumber; i++) {

                    nodes.push({
                        qAllValues: false,
                        qArea: {
                            qHeight: 1,
                            qLeft: i,
                            qTop: item.rowNumber,
                            qWidth: 1
                        }
                    });

                }

                nodes.push({
                    qAllValues: false,
                    qArea: {
                        qHeight: 1,
                        qLeft: item.colNumber + 1,
                        qTop: 0,
                        qWidth: 1
                    }
                });


                const a = {
                    MaxNbrOfNodes: 10000,
                    qTreeLevels: {
                        qDepth: -1,
                        qLeft: item.colNumber + 1
                    },
                    qTreeNodes: nodes
                };


                this.expandedNodes.push({ item, path: a });
            }

            await this.treeList.expandLeft("/qTreeDataDef", item.rowNumber, item.colNumber, false);

        }

        if (this.inSelect) {
            await this.treeList.beginSelections(["/qTreeDataDef"]);
        }

        return;
    }

    /**
     * select one or multiple items on listobject
     * @param item list item to be selected
     */
    public async select(item: IListItemExtended): Promise<void> {

        if (!this.inSelect) {
            await this.treeList.beginSelections(["/qTreeDataDef"]);
            this.selectedNodes = [];
        }

        if (this.selectedNodes.length > 0) {

            let isSelected = false;
            let pos: number;

            for (let i = 0; i < this.selectedNodes.length; i++) {
                const element = this.selectedNodes[i];

                if (element.col === item.colNumber && element.lable === item.label) {
                    isSelected = true;
                    pos = i;
                }
            }

            if (isSelected) {
                this.selectedNodes.splice(pos, 1);
            } else {
                this.selectedNodes.push({ lable: item.label, col: item.colNumber });
            }
        } else {
            this.selectedNodes.push({ lable: item.label, col: item.colNumber });
        }

        this.inSelect = true;
        await this.treeList.selectHyperCubeValues("/qTreeDataDef", item.colNumber, [item.elNumber], true);
        return;
    }

    /**
     * scroll to a specific list item
     * @param item list item to be scrolled to
     */
    public async scrollTo(item: IListItemExtended): Promise<number> {

        return new Promise<number>(async (resolve, reject) => {

            try {

                let a: any;

                for (const expandNode of this.expandedNodes) {
                    if (expandNode.item.colNumber === item.colNumber && expandNode.item.label === item.label) {
                        a = expandNode.path;
                    }
                }

                const data = await (this.treeList as any).getHyperCubeTreeData("/qTreeDataDef", a);
                console.log("scroll to data: ", data);

                resolve(data[0].qNodes[0].qRow);

            } catch (error) {
                reject(error);
            }

        });
    }

    /**
     * search in hypercube, this should interpreted as
     */
    public async search(value: string): Promise<boolean> {
        return;
    }

    /**
     * get the List Elements to be shown in the headder (breadcrump)
     */
    public getHeader(): IListItemExtended[] {
        return this.header;
    }
    //#endregion

    //#region private functions

    private removeExpandNode(item: IListItemExtended): void {

        for (let i = 0; i < this.expandedNodes.length; i++) {
            const node = this.expandedNodes[i].item;
            if (node.label === item.label && node.rowNumber === item.rowNumber) {
                this.expandedNodes.slice(i, 1);
            }
        }
        return;
    }

    private registerEvents(): void {
        this.treeList.on("changed", async () => {
            const data = await this.treeList.getLayout() as any;

            this.selectionIndexes = [];
            let rowCounter = 0;
            for (const dimension of data.qTreeData.qDimensionInfo) {
                if (dimension.qStateCounts.qSelected > 0) {
                    this.selectionIndexes.push(rowCounter);
                }
                rowCounter++;
            }

            this.expansionHc = this.calculateSizeOfHc((data.qTreeData as any).qNodesOnDim);
            this.dataModel.total = this.expansionHc.height;
            this.update$.next();
        });
    }

    private calculateSizeOfHc(nodesOnDimension: number[]): IExpansionHc {
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
        data: any,
        calcData: IListItemExtended[],
        index: number,
        parrentRowNumber = -1,
        colNum = -1
    ): IListItemExtended[] {
        const col = colNum + 1;

        for (const rawItem of data) {

            const state = rawItem.qAttrExps.qValues[1].qText;
            let isSelect = this.selectionIndexes.indexOf(col) > -1;
            if (isSelect) {
                isSelect = true;

                if (this.inSelect) {
                    const filtered = this.selectedNodes.filter((value) => {
                        if (value.lable === rawItem.qText) {
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
                isLast: col === this.expansionHc.maxWidth - 1
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
    //#endregion
}
