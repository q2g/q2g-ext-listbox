export namespace ListBox {

    export interface IItem {
        align: number;
        size: number;
    }

    export interface ISplit {
        active: boolean;
        align: 0 | 1;
        cols: number;
    }

    export interface IProperties {
        item: IItem;
        split: ISplit;
    }
}
