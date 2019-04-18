import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { GenericListSource } from "davinci.js";
import { Sort } from "extension/api/porperties.interface";
import { Subject } from "rxjs";
import { IListConfig } from 'davinci.js/listview/api/list-config.interface';
import { ListBoxProperties } from 'src/app/api/properties';

@Component({
    selector: "q2g-listbox",
    templateUrl: "listbox.component.html",
    styleUrls: ["./listbox.component.scss"]
})
export class ListboxComponent implements OnDestroy, OnInit, ExtensionComponent {

    public listSource: GenericListSource;

    private _model: EngineAPI.IGenericObject;

    private sessionObj: EngineAPI.IGenericList;

    private properties: EngineAPI.IGenericObjectProperties;

    private destroy$: Subject<boolean>;

    public constructor() {
        this.destroy$ = new Subject();
    }

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        this._model = model;
        this.registerEvents();
    }

    public orientation: "vertical" | "horizontal" = "vertical";

    public async ngOnInit() {
        // create a deep clone from object properties since we resolve a reference
        // if we call this._model.getProperties() again this will change propeties
        this.properties = JSON.parse(JSON.stringify(await this._model.getProperties()));
        this.sessionObj = await this._model.app.createSessionObject(
            this.createSessionProperties()
        );

        const config: IListConfig = {
            pageSize: 20
        };

        this.listSource = new GenericListSource(this.sessionObj, config);
        this.setOrientation();
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

    public onSearch(val) {
        /** we could pass event through not that bad solution */
        this.sessionObj.searchListObjectFor("/qListObjectDef", val);
    }

    /** root cell has been resized in grid, this is not the same as window resize */
    public rootCellResized(): void {
        console.log("root cell resized and we know it");
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

        /** get current and new extension properties */
        const curObjProperties = this.properties;
        const newObjProperties = await this._model.getProperties();

        /** get current and new properties */
        const curProperties = curObjProperties.properties;
        const newProperties = newObjProperties.properties;

        /** get current and new field definitions */
        const curFieldDefs: string[] = curObjProperties.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs;
        const newFieldDefs: string[] = newObjProperties.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs;

        let noChange = JSON.stringify(newProperties) === JSON.stringify(curProperties);
            noChange = noChange && newFieldDefs.sort().toString() === curFieldDefs.sort().toString();

        /** @todo skip orientation since this only change the view of data not the data itself */

        /** neither extension properties nor field defs has been changed so we could skip */
        if (noChange) {
            return;
        }

        /** create new clone from extension properties */
        this.properties = JSON.parse(JSON.stringify(newObjProperties));

        /** create new session properties and update session object */
        const sessionProperties = await this.createSessionProperties();
        this.sessionObj.setProperties(sessionProperties);
        this.setOrientation();
    }

    private setOrientation() {
        switch (this.properties.properties.orientation) {
            case ListBoxProperties.Orientation.vertical: 
                this.orientation = "vertical";
                break;
            default:
                this.orientation = "horizontal";
        }
    }
}
