import {
    Component,
    Input,
    Inject,
    ViewChild,
    AfterViewInit,
    ComponentFactory,
    ViewContainerRef,
    Injector,
    OnDestroy,
} from "@angular/core";
import { App } from "../../services/qlik-global-module.factory";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { DOCUMENT } from "@angular/platform-browser";

declare module qlik {
    const e: RootAPI.IRoot;
}

@Component({
    selector: "q2g-ngx-extension",
    styleUrls: ["./bootstrap.component.scss"],
    templateUrl: "bootstrap.component.html"
})
export class BootstrapComponent implements AfterViewInit, OnDestroy {

    /** extension we want to load */
    private extension: ExtensionComponent;

    /** grid cell which holds current extension */
    private rootCellEl: Element;

    /** current root cell measures */
    private rootCellMeasure: ClientRect;

    /**
     * mutation observer to watch dom changes on root cell
     * if we change size / width in edit mode for grid cell
     * will not trigger on window resize event
     */
    private mutationObserver: MutationObserver;

    @Input()
    private objectId: string;

    /**
     * set rootCell id, if one is given attach mutation observer 
     * to get notified style has been changed this only works
     * if style propertie is updated in dom not in css file
     */
    @Input()
    public set rootCell(id: string) {
        /** catch dom element by id */
        this.rootCellEl = this.document.querySelector(`#${id}`);
        if (this.rootCellEl) {
            this.rootCellMeasure = this.rootCellEl.getBoundingClientRect();
            this.mutationObserver.observe(this.rootCellEl, {
                attributes: true,
                attributeFilter: ["style"]
            });
        }
    }

    /** switched edit / analysis mode */
    @Input()
    public set mode(mode: "edit" | "analysis") {
        if (!this.extension) {
            return;
        }
        this.extension.updateSize();
    }

    @ViewChild("extensionRoot", { read: ViewContainerRef })
    private extensionRoot: ViewContainerRef;

    constructor(
        @Inject("ExtensionView") private view: ComponentFactory<ExtensionComponent>,
        @Inject(App) private app: EngineAPI.IApp,
        @Inject(DOCUMENT) private document: Document,
        private injector: Injector,
    ) {
        /** create new mutation observer to watch dom manipulations */
        this.mutationObserver = new MutationObserver(this.handleDomMutations.bind(this));
    }

    async ngAfterViewInit() {
        /** load model and bootstrap extension view */
        const currentApp: any = await this.app.getObject(this.objectId);
        this.bootstrapView(currentApp.enigmaModel);
    }

    public ngOnDestroy() {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
    }

    /** bootstrap extension view */
    private bootstrapView(model: EngineAPI.IGenericObject) {
        const extensionView = this.extensionRoot.createComponent<ExtensionComponent>(this.view, 0, this.injector);
        extensionView.instance.model = model;
        this.extension = extensionView.instance;
    }

    /** 
     * in extension edit mode, styles for root cell could be change size or height
     * and postion, if this is the case we trigger an update on the extension to repaint itself
     * or just update some dom properties since we need it.
     */
    private handleDomMutations(mutations: MutationRecord[]) {
        const hasStyleChange = mutations.some((mutation) => mutation.attributeName === "style");

        if (!hasStyleChange) {
            return;
        }

        if (this.hasSizeChange()) {
            this.extension.updateSize();
        }
    }

    /** check the size of root cell has been changed */
    private hasSizeChange(): boolean {

        const newMeasures = this.rootCellEl.getBoundingClientRect();
        
        const newHeight = newMeasures.height;
        const newWidth  = newMeasures.width;

        const oldHeight = this.rootCellMeasure.height;
        const oldWidth  = this.rootCellMeasure.width;

        if (oldWidth !== newWidth || oldHeight !== newHeight) {
            this.rootCellMeasure = newMeasures;
            return true;
        }
        return false;
    }
}
