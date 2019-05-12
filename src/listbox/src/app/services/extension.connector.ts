import { PropertiesModel } from '../model/properties.model';
import { Subject, ReplaySubject } from 'rxjs';
import { Sort } from 'extension/api/porperties.interface';
import { ListProperties } from '../model/list-properties.model';
import { mapDataTo } from '../utils/map-data-to.decorator';

export interface IExtensionUpdate {
    type: "session" | "source" | "view",
    properties: PropertiesModel
}

export class ExtensionConnector {

    public update$: Subject<IExtensionUpdate> = new Subject();

    public connected: ReplaySubject<PropertiesModel> = new ReplaySubject(1);

    private changeHandler

    private extensionModel: EngineAPI.IGenericObject;

    private extensionProperties = new PropertiesModel();

    /** 
     * connect
     */
    public async connect( model: EngineAPI.IGenericObject ) {

        this.extensionModel = model;

        /** register events to handle changes */
        this.registerEvents();

        /** fetch initial properties */
        await this.fetchProperties();
        this.connected.next(this.extensionProperties);
    }

    /**
     * clear events
     */
    public disconnect() {
        (this.extensionModel as any).removeListener( "changed", this.changeHandler );
        this.extensionModel = null;
        this.extensionProperties = null;
    }

    /**
     * register on change event for extension model if some properties has
     * been changed, this will called multiple times
     */
    private registerEvents() {
        this.changeHandler = this.handleChange.bind( this );
        this.extensionModel.on( "changed", this.changeHandler );
    }

    /**
     * model triggers a change, we have to check what has been changed
     */
    private async handleChange() {
        /** get new object properties */
        const newSettings = await this.extensionModel.getProperties();
        this.checkChanges( newSettings );
    }

    /**
     * fetch extension properties
     */
    private async fetchProperties(): Promise<void> {
        const settings = await this.extensionModel.getProperties();
        const listboxSettings = { ...settings.properties.listbox };

        this.extensionProperties.listConfiguration = listboxSettings;
        this.extensionProperties.dimension = settings.qHyperCubeDef.qDimensions;
        this.extensionProperties.sorting = settings.properties.sort.by;
    }

    /**
     * check for changes and trigger an update if required
     */
    private checkChanges(settings) {

        const newDimensions = settings.qHyperCubeDef.qDimensions;
        /** amount of sources has been changed, this will cause a switch in Source (Tree / Generic List) */
        const isSource      = this.isDimensionBreak(newDimensions);
        /** check we have changed some view properties, no need to check this if source has been changed allready */
        const isView        = isSource || this.isViewChange(settings.properties.listbox);

        /** check we only update some sorting properties */
        let isSession = isSource || this.isDimensionChange(newDimensions);
        isSession     = isSession || this.isSortingChange(settings.properties.sort.by);

        /** write new extension properties */
        this.extensionProperties.listConfiguration = { ...settings.properties.listbox };
        this.extensionProperties.dimension         = settings.qHyperCubeDef.qDimensions;
        this.extensionProperties.sorting           = settings.properties.sort.by;

        /** if we have an break or patch trigger an update */
        if (isSession || isSource) {
            this.update$.next({
                type: isSource ? "source" : "session",
                properties: this.extensionProperties
            });
        } else {
            if (isView) {
                this.update$.next({
                    type: "view",
                    properties: this.extensionProperties
                });
            }
        }
    }

    /** 
     * check dimension count has been changed 
     * but this is only required if we switch from 1 dimension up to 2 or other side
     * if we have allready 2 dimensions and go up to 3 dimensions it will stay on tree
     */
    private isDimensionBreak(newDimension: EngineAPI.INxDimension[]): boolean {
        const properties = this.extensionProperties;
        const curDimensionCount = properties.dimension.length;
        const newDimensionCount = newDimension.length;
        return (curDimensionCount !== newDimensionCount) && (curDimensionCount === 1 || newDimensionCount === 1);
    }

    /** 
     * check dimensions has been changed 
     */
    private isDimensionChange(newDimension: EngineAPI.INxDimension[]): boolean {
        const properties = this.extensionProperties;
        const curDimensionSettings = JSON.stringify(properties.dimension);
        const newDimensionSettings = JSON.stringify(newDimension);
        return curDimensionSettings !== newDimensionSettings;
    }

    /**
     * check sorting values has been changed
     */
    private isSortingChange(sorting: Sort.Criterias): boolean {
        const properties = this.extensionProperties;
        const newSorting = JSON.stringify(sorting);
        const curSorting = JSON.stringify(properties.sorting);

        return newSorting !== curSorting;
    }

    /**
     * check we have some changes in the view
     * passed argument will first create a new list model so we 
     * ensure both objects (old / new) are from same type and could be compared
     */
    @mapDataTo(ListProperties)
    private isViewChange(newList: ListProperties): boolean {
        const properties = this.extensionProperties;
        const oldConf = properties.listConfiguration.toString();
        const newConf = newList.toString();

        return oldConf !== newConf;
    }
}
