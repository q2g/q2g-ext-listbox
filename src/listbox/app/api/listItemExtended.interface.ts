import { IListItem } from "davinci.js";

export interface IListItemExtended extends IListItem<any> {
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
