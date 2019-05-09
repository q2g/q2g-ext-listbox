import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { ListViewComponent } from "davinci.js";
import { Sort } from "extension/api/porperties.interface";
import { Subject } from "rxjs";
import { ListBoxProperties } from 'src/app/api/properties';
import { GenericListSource } from '../../model/generic-list.source';
import { TreeListSource } from "../../model/tree-list.source";

@Component({
    selector: "q2g-listbox",
    templateUrl: "listbox.component.html",
    styleUrls: ["./listbox.component.scss"]
})
export class ListboxComponent implements OnDestroy, OnInit, ExtensionComponent {

    public listSource: GenericListSource | TreeListSource;

    private _model: EngineAPI.IGenericObject;

    private destroy$: Subject<boolean>;

    @ViewChild(ListViewComponent)
    private listView: ListViewComponent<any>;

    /** deep clone of object extension properties */
    private properties: EngineAPI.IGenericObjectProperties;

    /** current session object for app */
    private sessionObj: EngineAPI.IGenericList;

    public constructor() {
        this.destroy$ = new Subject();
    }

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        this._model = model;
        this.registerEvents();
    }

    /** orientation from list by default this should be vertical */
    public orientation: ListBoxProperties.Orientation = ListBoxProperties.Orientation.vertical;

    public async ngOnInit() {

        // create a deep clone from object properties since we resolve a reference
        // if we call this._model.getProperties() again this will change propeties
        this.properties = JSON.parse(JSON.stringify(await this._model.getProperties()));

        /*
        const properties = new Properties();
        properties.cols = 2;
        */

        if (this.properties.qHyperCubeDef.qDimensions.length > 1) {
            this.sessionObj = await this._model.app.createSessionObject(this.createSessionTreeProperties());
            this.listSource = new TreeListSource(this.sessionObj);
        } else {
            this.sessionObj = await this._model.app.createSessionObject(this.createSessionProperties());
            this.listSource = new GenericListSource(this.sessionObj);
        }
        this.orientation = this.properties.properties.orientation;
    }

    /**
     * compent gets destroyed, remove session object and trigger
     * destroyed to remove event listeners
     */
    public ngOnDestroy() {
        this._model.app.destroySessionObject(this.sessionObj.id);
        this.destroy$.next(true);
        this._model = null;
    }

    /** register on search event */
    public async onSearch(val): Promise<void> {
        await this.listView.search(val);
    }

    /** @inheritdoc */
    public updateSize(): void {
        // this.listView.updateSize();
    }

    /** create session params for generic list */
    private createSessionTreeProperties(): EngineAPI.IGenericListProperties {

        const dimensionList: {name: string, value: string, measure: string}[] = [];

        for (const dimension of this.properties.qHyperCubeDef.qDimensions as EngineAPI.INxDimension[]) {
            console.log(dimension);
            dimensionList.push({
                name: dimension.qDef.qFieldLabels[0],
                value: dimension.qDef.qFieldDefs[0],
                measure: dimension.qAttributeExpressions[0].qExpression
            });
        }

        const info: EngineAPI.INxInfo = {
            qType: "TreeCube",
            qId: ""
        };

        let measure = "only({1} if(";
        let measurePart1 = "";
        let measurePart2 = "";

        for (const dimension of dimensionList) {
            measurePart1 += "not isnull([" + dimension.value + "]) or ";
            measurePart2 += "[" + dimension.value + "]" + "&";
        }

        measure += measurePart1.slice(0, -3) + ",'O' , 'N' ))&only(if(not isnull(" + measurePart2.slice(0, -1);
        measure += "),'N', 'O'))";


        const dimensions: EngineAPI.INxDimension[] = [];
        for (const dimension of dimensionList) {
            const newDimension: any = {
                qDef: {
                    qFieldDefs: [
                        dimension.value
                    ],
                    qFieldLabels: [
                        dimension.name
                    ]
                },
                qAttributeExpressions: [
                    {
                        qExpression: dimension.measure
                    },
                    {
                        qExpression: measure
                    }
                ]
            };
            dimensions.push(newDimension);
        }

        const listParam: any = {
            qExtendsId: "",
            qMetaDef: {},
            qStateName: "$",
            qInfo: info,
            qTreeDataDef: {
                qAlwaysFullyExpanded: false,
                qMode: "DATA_MODE_TREE",
                qStateName: "$",
                qDimensions: dimensions,
            }
        };

        return listParam;
    }

    /** create session params for generic list */
    private createSessionProperties(): EngineAPI.IGenericListProperties {
        const listParam: EngineAPI.IGenericListProperties = {
            qInfo: { qType: "ListObject" },
            qListObjectDef: {
                qStateName: "$",
                qAutoSortByState: {
                    qDisplayNumberOfRows: -1
                },
                qLibraryId: this.properties.qHyperCubeDef.qDimensions[0].qDef.qLibraryId,
                qDef: {
                    qFieldDefs: this.properties.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs,
                    qSortCriterias: [
                        this.createSortCriterias(this.properties.properties.sort.by)
                    ] as any
                },
                qFrequencyMode: "NX_FREQUENCY_NONE",
                qInitialDataFetch: [
                    {
                        qHeight: 0,
                        qLeft: 0,
                        qTop: 0,
                        qWidth: 0
                    }
                ],
                qShowAlternatives: true
            }
        };
        return listParam;
    }

    /** create sort direction definitions */
    private createSortCriterias(criterias: Sort.Criterias): EngineAPI.ISortCriteria {
        const p: EngineAPI.ISortCriteria = {
            qSortByAscii: this.getSortDirection(criterias.ascii) as any,
            qSortByExpression: this.getSortDirection(
                criterias.expression
            ) as any,
            qSortByFrequency: this.getSortDirection(criterias.frequency) as any,
            qSortByLoadOrder: this.getSortDirection(criterias.loadOrder) as any,
            qSortByNumeric: this.getSortDirection(criterias.numeric) as any,
            qSortByState: this.getSortDirection(criterias.state) as any
        };
        p.qExpression = criterias.expression.value;
        return p;
    }

    /** get current sort direction for field */
    private getSortDirection(field: Sort.Field<EngineAPI.TypeSortDirection | EngineAPI.IValueExpr>): number {
        if (!field.enabled) {
            return 0;
        }
        return field.orderBy === "a" ? 1 : -1;
    }

    /** register to changed event on model */
    private registerEvents() {
        /** save eventhandle fn since we need it to unsubscribe */
        const handler = this.handleModelChanged.bind(this);

        /** register event handle on model changed event */
        this._model.on("changed", handler);

        /** register to unsubscribe so we can remove changed event handler to avoid memory leaks */
        this.destroy$.subscribe(() =>
            (this._model as any).removeListener("changed", handler)
        );
    }

    /** check properties have been changed so we have to redraw data could be also placed in bootstrap component */
    private async handleModelChanged() {

        /** get new object properties */
        const newProperties = await this._model.getProperties();

        const requireUpdate = this.hasOrientationChange(newProperties.properties.orientation);
        const requireSessionUpdate = this.hasChanges(this.properties, newProperties);

        if (!requireSessionUpdate && !requireUpdate) {
            return;
        }

        /** create new clone from extension properties */
        this.properties = JSON.parse(JSON.stringify(newProperties));
        this.orientation = newProperties.properties.orientation;

        if (requireSessionUpdate) {
            /** create new session properties and update session object */
            /** this will cause an change event */
            const sessionProperties = await this.createSessionProperties();
            this.sessionObj.setProperties(sessionProperties);
            return;
        }
    }

    /** check we got changes on properties */
    private hasChanges(newProperties, curProperties): boolean {

        /** get current and new field definitions */
        const curFieldDefs: string[] = curProperties.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs;
        const newFieldDefs: string[] = newProperties.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs;

        let noChange = true;

        /** check properties has been changed */
        noChange = JSON.stringify(newProperties.properties) === JSON.stringify(curProperties.properties);

        /** check field defs has been changed */
        noChange = noChange && newFieldDefs.sort().toString() === curFieldDefs.sort().toString();

        /** no change if we only change the orientation, this will not update the data only the visualization */
        noChange = noChange && newProperties.properties.orientation === this.orientation;

        return !noChange;
    }

    private hasOrientationChange(newOrientation: ListBoxProperties.Orientation): boolean {
        return this.orientation !== newOrientation;
    }
}
