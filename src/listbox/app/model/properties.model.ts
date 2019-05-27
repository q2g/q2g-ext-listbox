import { ListProperties } from './list-properties.model';
import { mapDataTo } from '../utils/map-data-to.decorator';
import { Sort } from "../api/porperties.interface"
import { clone } from '../utils/clone.decorator';

export class PropertiesModel {

    private listConfig: ListProperties = new ListProperties();

    private extensionDim: EngineAPI.INxDimension[];

    private extensionSort: Sort.Criterias;

    private _dirty: boolean;

    @mapDataTo(ListProperties)
    public set listConfiguration(data: ListProperties) {
        this.listConfig = data;
    }

    public get listConfiguration(): ListProperties {
        return this.listConfig;
    }

    @clone
    public set dimension(dim: EngineAPI.INxDimension[]) {
        this.extensionDim = dim;
    }

    public get dimension(): EngineAPI.INxDimension[] {
        return this.extensionDim;
    }

    @clone
    public set sorting(sort: Sort.Criterias) {
        this.extensionSort = sort;
    }

    public get sorting(): Sort.Criterias {
        return this.extensionSort;
    }

    public set dirty(dirty: boolean) {
        this._dirty = dirty;
    }

    public get dirty(): boolean {
        return this._dirty;
    }
}
