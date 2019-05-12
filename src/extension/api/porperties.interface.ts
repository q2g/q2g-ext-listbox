export namespace Sort {

    export enum Mode {
        AUTOMATIC = 1,
        INDIVIDUAL = 0
    }

    declare type SortField = Field<EngineAPI.TypeSortDirection>;

    export interface Criterias {
        state: SortField;
        frequency: SortField;
        numeric: SortField;
        ascii: SortField;
        loadOrder: SortField;
        expression: Field<EngineAPI.IValueExpr>
    }

    export interface Field<T> {
        enabled: boolean,
        orderBy: "a" | "d",
        value: T
    }
}

export interface IListboxProperties {
    itemAlign: number;
    itemSize: number;
    splitActive: boolean;
    splitAlign: 0 | 1;
    splitCols: number;
}

export interface IProperties {
    sort: {
        by: Sort.Criterias,
        mode: Sort.Mode
    },
    listbox: IListboxProperties
}
