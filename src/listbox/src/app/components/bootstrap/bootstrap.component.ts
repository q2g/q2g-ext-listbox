import {
    Component,
    Input,
    Inject,
    ViewChild,
    AfterViewInit,
    ComponentFactory,
    ViewContainerRef,
    Injector
} from "@angular/core";
import { App } from "../../services/qlik-global-module.factory";
import { ExtensionComponent } from "../../api/extension.component.interface";

@Component({
    selector: "q2g-ngx-extension",
    templateUrl: "bootstrap.component.html"
})
export class BootstrapComponent implements AfterViewInit {
    @Input()
    private objectId: string;

    @ViewChild("extensionRoot", { read: ViewContainerRef })
    private extensionRoot: ViewContainerRef;

    constructor(
        @Inject("ExtensionView")
        private view: ComponentFactory<ExtensionComponent>,
        @Inject(App) private app: EngineAPI.IApp,
        private injector: Injector
    ) {}

    async ngAfterViewInit() {
        /** load model and bootstrap extension view */
        const currentApp: any = await this.app.getObject(this.objectId);
        this.bootstrapView(currentApp.enigmaModel);
    }

    /** bootstrap extension view */
    private bootstrapView(model: EngineAPI.IGenericObject) {
        const extensionView = this.extensionRoot.createComponent<
            ExtensionComponent
        >(this.view, 0, this.injector);
        extensionView.instance.model = model;
    }
}
