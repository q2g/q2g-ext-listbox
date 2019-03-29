import { Component, Input, Inject, ViewChild, AfterViewInit, ComponentFactory, ViewContainerRef, Injector } from "@angular/core";
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
        @Inject("ExtensionView") private view: ComponentFactory<ExtensionComponent>,
        @Inject(App) private app: EngineAPI.IApp,
        private injector: Injector
    ) {}

    ngAfterViewInit() {
        /** load model and bootstrap extension view */
        this.app.getObject(this.objectId)
        .then((model: EngineAPI.IGenericObject) => {
            this.bootstrapView(model);
        });
    }

    /** bootstrap extension view */
    private bootstrapView(app: EngineAPI.IGenericObject) {
        const extensionView = this.extensionRoot.createComponent<ExtensionComponent>(this.view, 0, this.injector);
        extensionView.instance.model = app;
    }
}
