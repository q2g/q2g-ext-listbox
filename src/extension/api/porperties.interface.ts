export namespace Sort {

    export enum Mode {
        AUTOMATIC  = 1,
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

export interface IProperties {
    sort: {
        by: Sort.Criterias,
        mode: Sort.Mode
    },
    horizontalmode: boolean;
    splitcolumns: number;
    fieldSize: number;
    splitmode: boolean;
    splitorientation: boolean;
}
