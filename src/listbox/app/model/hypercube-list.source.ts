import { ListActions } from "../api/list-selection";
import { IListItem, ListSource } from "davinci.js";

/**
 * list source adapter so we dont need to implement all abstract methods
 * and ensure we have all methods
 */
export abstract class HypercubeListSource<T> extends ListSource<T> implements ListActions<T> {

    public async select(item: IListItem<T>): Promise<void> { /** noop */ }

    public reverseSelection() { /** noop */ }

    public async cancelSelection(): Promise<void> { /** noop */ }

    public async acceptSelection(): Promise<void> { /** noop */ }

    abstract scrollTo(item: any): number;
}
