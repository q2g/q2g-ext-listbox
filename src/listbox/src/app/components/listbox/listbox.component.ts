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
import { debounceQlikSession } from 'src/app/services/create-session.operator';
import { Subject } from 'rxjs';

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

    private openSession: Subject<EngineAPI.IApp>;

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
        this.openSession = new Subject();
    }

    public ngOnInit() {

        this.openSession
            .pipe(debounceQlikSession())
            .subscribe(() => {
                // session has been created
                // last request we submitted should be taken
            });
    }

    public ngOnDestroy() {
        this.model = null;
    }

    /**
     * handle model change event
     */
    private async modelChange() {
        const layout: EngineAPI.IGenericHyperCubeLayout = (await this._model.getLayout()) as EngineAPI.IGenericHyperCubeLayout;

        /** @todo get layout data */

        /** apply items */
        this.changeDetector.detectChanges();
    }

    /**
     * create new session object
     * @param {EngineAPI.IApp} app
     */
    private async createSession(
        app: EngineAPI.IApp
    ): Promise<EngineAPI.IGenericObject> {
        const session = await app.createSessionObject({
            qInfo: {
                qType: "q2gListboxListObject"
            }
        });
        return session;
    }

    /**
     * destroy existing session object
     * @param {string} sessionId 
     */
    private destroySession(sessionId: string) {
        this._model.app.destroySessionObject(sessionId);
    }

    /**
     * initialize model
     * @param model
     */
    private async initializeSession(model) {

        /** if session allready exists remove session before */
        if (this.session) {
            await this.destroySession(this.session.id);
        }

        /** create new session */
        this.session = await this.createSession(model);

        /** @todo unregister events since we dont need them anymore */
    }
}
