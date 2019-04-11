import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { GenericListSource } from 'davinci.js';

@Component({
    selector: "q2g-listbox",
    templateUrl: "listbox.component.html",
    styleUrls: ["./listbox.component.scss"],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListboxComponent implements OnDestroy, OnInit, ExtensionComponent {

    public listSource: GenericListSource;

    private _model: EngineAPI.IGenericObject;

    private sessionObj: EngineAPI.IGenericList;

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        this._model = model;
    }

    public async ngOnInit() {
        this.sessionObj = await this._model.app.createSessionObject(this.createSessionParams());
        this.listSource = new GenericListSource(this.sessionObj);
    }

    public ngOnDestroy() {
        this._model.app.destroySessionObject(this.sessionObj.id);
        this._model = null;
    }

    public onSearch(val) {
    }

    /** create session params for generic list */
    private createSessionParams(): EngineAPI.IGenericListProperties {

        const listParam: EngineAPI.IGenericListProperties = {
            qInfo: { qType: "ListObject" },
            qListObjectDef: {
                qStateName: "$",
                qAutoSortByState: {
                    qDisplayNumberOfRows: -1
                },
                qLibraryId: "",
                qDef: {
                    qFieldDefs: ["Name"]
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
}
