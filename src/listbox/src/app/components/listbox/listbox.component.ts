import {
    Component,
    Input,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    OnDestroy,
    OnInit
} from "@angular/core";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { ViewportControl } from "ngx-customscrollbar";
import { debounceQlikSession } from "src/app/services/create-session.operator";
import { ReplaySubject } from "rxjs";
import { switchMap } from 'rxjs/operators';

@Component({
    selector: "q2g-listbox",
    templateUrl: "listbox.component.html",
    styleUrls: ["./listbox.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [ViewportControl]
})
export class ListboxComponent implements OnDestroy, OnInit, ExtensionComponent {
    public items: any[];

    private _model: EngineAPI.IGenericObject;

    private session: EngineAPI.IGenericObject;

    private openSession: ReplaySubject<EngineAPI.IApp>;

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        /**
         * this could called twice in a row before session is created
         * that will cause a bug we have one open connection left thats not
         * what we want, try to debounce the request
         */
        if (model) {
            this._model = model;
            // send model app to try open a session
            this.openSession.next(model.app);
            return;
        }

        if (!model && this.session) {
            this.destroySession(this.session.id);
        }
    }

    public constructor(private changeDetector: ChangeDetectorRef) {
        this.openSession = new ReplaySubject(1);
    }

    public ngOnInit() {

        /** @todo move to own function */
        const listParam: EngineAPI.IGenericListProperties = {
            qInfo: {
                qType: "ListObject"
            },
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
                        qHeight: 20,
                        qLeft: 0,
                        qTop: 0,
                        qWidth: 1
                    }
                ],
                qShowAlternatives: true
            }
        };

        this.openSession
            .pipe(
                /** debounce qlik sessions if multiple will be open only the last one will taken */
                debounceQlikSession<
                    EngineAPI.IGenericListProperties,
                    EngineAPI.IGenericList
                >(listParam),
                /** if session has been opened we want to get current data for testing issues */
                switchMap((session) => session.getLayout())
            )
            .subscribe(response => {
                console.log(response);
            });
    }

    public ngOnDestroy() {
        this.model = null;
    }

    /**
     * destroy existing session object
     * @param {string} sessionId
     */
    private destroySession(sessionId: string) {
        this._model.app.destroySessionObject(sessionId);
    }
}
