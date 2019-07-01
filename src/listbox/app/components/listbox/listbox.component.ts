import { Component, Input, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { ListViewComponent, IListItem } from "davinci.js";
import { Subject } from "rxjs";
import { takeUntil, switchMap } from "rxjs/operators";
import { ExtensionComponent } from "../../api/extension.component.interface";
import { ExtensionConnector, IExtensionUpdate } from "../../services/extension.connector";
import { SessionPropertiesFactory } from "../../services/session-properties.factory";
import { PropertiesModel } from "../../model/properties.model";
import { TreeListSource } from "../../model/tree-list.source";
import { GenericListSource } from "../..//model/generic-list.source";
import { ListProperties } from "../../model/list-properties.model";
import { HypercubeListSource } from "../../model/hypercube-list.source";

@Component( {
    selector: "q2g-listbox",
    templateUrl: "listbox.component.html",
    styleUrls: ["./listbox.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ListboxComponent implements OnDestroy, OnInit, ExtensionComponent {

    public listSource: HypercubeListSource<EngineAPI.INxCell>;

    public listSource2: HypercubeListSource<EngineAPI.INxCell>;

    public inSearch = false;

    public listAlign: "vertical" | "horizontal" = "vertical";

    public splitCols = 1;

    public itemSize = 30;

    public splitAlign: "vertical" | "horizontal" = "vertical";

    public isTree = false;

    private session: any;

    private app: EngineAPI.IApp;

    private extensionConnector: ExtensionConnector;

    private destroy$: Subject<boolean>;

    @ViewChild( ListViewComponent )
    private listView: ListViewComponent<any>;

    public constructor(
        private sessPropFactory: SessionPropertiesFactory,
        private changeDetector: ChangeDetectorRef
    ) {
        this.destroy$ = new Subject();
        this.extensionConnector = new ExtensionConnector();
    }

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        this.app = model.app;
        this.extensionConnector.connect(model);
    }

    /**
     * on initialize watch the extension connector
     * for new connection or any update
     */
    public ngOnInit() {
        this.extensionConnector.connected
            .pipe(
                takeUntil( this.destroy$ ),
                switchMap((properties) => {
                    this.applyProperties( properties );
                    return this.extensionConnector.update$;
                })
            )
            .subscribe( ( update: IExtensionUpdate ) => this.handleExtensionUpdate( update ) );
    }

    /**
     * destroy component
     */
    public ngOnDestroy() {
        this.extensionConnector.disconnect();
        this.destroy$.next( true );
    }

    /** register on search event */
    public async onSearch( val ): Promise<void> {
        /** @todo trigger search on source not on view */
        this.inSearch = true;
        this.isTree = false;
        await this.listView.search( val );
    }

    /** @inheritdoc */
    public updateSize(): void {
        /** update list view change */
        this.listView.resize();
    }

    public expandCollapseItem( item ) {
        this.listSource.expandCollapseItem( item );
    }

    private handleExtensionUpdate( update: IExtensionUpdate ) {
        switch ( update.type ) {
            case "view":
                this.setViewProperties( update.properties.listConfiguration );
                break;
            case "session":
                this.handleSessionUpdate( update.properties );
                break;
            default:
                this.handleSourceUpdate( update.properties );
        }

        /**
         * this is black magic, but we have to do this otherwise
         * our properties will not change ... and i dont know why
         */
        this.changeDetector.detectChanges();
        this.listView.reload();
    }

    private handleSourceUpdate(properties: PropertiesModel) {
        this.listSource.disconnect();
        this.applyProperties(properties);
    }

    private handleSessionUpdate( properties: PropertiesModel ) {
        const sessionConfig = properties.dimension.length > 1
            ? this.sessPropFactory.createTreeProperties( properties )
            : this.sessPropFactory.createGenericList( properties );

        this.session.setProperties(sessionConfig);
    }

    /** set view properties */
    private setViewProperties(properties: ListProperties) {
        if (this.isTree) {
            this.listAlign = "vertical";
            this.itemSize  = 30;
            this.splitAlign = "vertical";
            this.splitCols = 1;
        } else {
            this.listAlign = properties.itemAlign;
            this.itemSize = properties.itemAlign === "horizontal" ? properties.itemSize : 30;
            this.splitAlign = properties.splitActive ? properties.splitAlign : "vertical";
            this.splitCols = properties.splitActive ? properties.splitCols : 1;
        }
    }

    /**
     * read out properties from extension propertie model
     * and pass it to view
     */
    private async applyProperties( properties: PropertiesModel ) {
        this.isTree = properties.dimension.length > 1;
        this.listSource = await this.createSource(properties);
        this.setViewProperties(properties.listConfiguration);
        this.changeDetector.detectChanges();
    }

    /**
     * create source for listview
     */
    private async createSource( properties: PropertiesModel ): Promise<HypercubeListSource<any>> {

        let sessionConfig;
        let listSource;

        if ( properties.dimension.length > 1 ) {
            sessionConfig = this.sessPropFactory.createTreeProperties( properties );
            this.session = await this.app.createSessionObject( sessionConfig );

            const sessionConfigListSource = this.sessPropFactory.createGenericList( properties );
            const listSourceExtended = await this.app.createSessionObject( sessionConfigListSource );

            listSource = new TreeListSource(this.session );
            this.listSource2 = new GenericListSource( listSourceExtended );
        } else {
            sessionConfig = this.sessPropFactory.createGenericList( properties );
            this.session = await this.app.createSessionObject( sessionConfig );
            listSource = new GenericListSource( this.session );
        }

        return listSource;
    }

    public accept() {
        if (this.inSearch) {
            if (this.listSource2) {
                this.listSource2.acceptListObjectSearch();
            } else {
                this.listSource.acceptListObjectSearch();
            }
            this.inSearch = false;
            this.isTree = true;
            return;
        }
        this.listSource.acceptSelection();
    }

    public cancel() {
        if (this.inSearch) {
            if (this.listSource2) {
                this.listSource2.abortListObjectSearch();
            } else {
                this.listSource.abortListObjectSearch();
            }
            this.inSearch = false;
            this.isTree = true;
            return;
        }

        this.listSource.cancelSelection();
    }

    public onSelectItem(item: IListItem<EngineAPI.INxCell>) {
        this.listSource.select(item);
    }

    public itemClick(item: IListItem<any>) {
        this.listSource.select(item);
    }

    public async scrollTo(item: IListItem<any>) {
        const index = await this.listSource.scrollTo(item);
        console.log("INDEX", index);
        this.listView.scrollTo(this.itemSize * index);
    }
}
