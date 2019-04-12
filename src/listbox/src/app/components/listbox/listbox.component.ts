import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { GenericListSource } from "davinci.js";
import { Sort } from "extension/api/porperties.interface";

@Component({
    selector: "q2g-listbox",
    templateUrl: "listbox.component.html",
    styleUrls: ["./listbox.component.scss"]
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxComponent implements OnDestroy, OnInit, ExtensionComponent {
    public listSource: GenericListSource;

    private _model: EngineAPI.IGenericObject;

    private sessionObj: EngineAPI.IGenericList;

    private properties: EngineAPI.IGenericObjectProperties;

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        this._model = model;
    }

    public async ngOnInit() {

        this.properties = await this._model.getProperties();
        this.sessionObj = await this._model.app.createSessionObject(
            this.createSessionParams()
        );

        const config = {
            pageSize: 20
        };
        this.listSource = new GenericListSource(this.sessionObj, config);
    }

    public ngOnDestroy() {
        this._model.app.destroySessionObject(this.sessionObj.id);
        this._model = null;
    }

    public onSearch(val) {}

    /** create session params for generic list */
    private createSessionParams(): EngineAPI.IGenericListProperties {

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
                    qSortCriterias: [this.createSortCriterias(this.properties.properties.sort.by)] as any
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

    private createSortCriterias(criterias: Sort.Criterias): EngineAPI.ISortCriteria {
        const p: EngineAPI.ISortCriteria = {
            qSortByAscii: this.getSortDirection(criterias.ascii) as any,
            qSortByExpression: this.getSortDirection(criterias.expression) as any,
            qSortByFrequency: this.getSortDirection(criterias.frequency) as any,
            qSortByLoadOrder: this.getSortDirection(criterias.loadOrder) as any,
            qSortByNumeric: this.getSortDirection(criterias.numeric) as any,
            qSortByState: this.getSortDirection(criterias.state) as any
        }
        p.qExpression = criterias.expression.value;
        return p;
    }

    private getSortDirection(field: Sort.Field<EngineAPI.TypeSortDirection | EngineAPI.IValueExpr>): number {
        if (!field.enabled) {
            return 0;
        }
        return field.orderBy === "a" ? 1 : -1;
    }
}
