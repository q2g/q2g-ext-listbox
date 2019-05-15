import { IListItem, ListSource, ItemIcon, ItemState, SelectionState } from 'davinci.js';

declare type ListItem =
    | IListItem<EngineAPI.INxCell>
    | IListItem<EngineAPI.INxCell>[];

/** only possible to make it free from listsource is to use a decorator */
export class GenericListSource extends ListSource<EngineAPI.INxCell> {

    /**
     * Creates an instance of GenericListSource.
     */
    public constructor(
        private genericList: EngineAPI.IGenericList
    ) {
        super();
        this.registerEvents();
    }

    /**
     * deselect one or multiple items on hypercube
     */
    public deselect(item: ListItem) {
        this.toggleSelection( item );
    }

    /**
     * select one or multiple items on listobject
     */
    public select(item: ListItem) {
        this.toggleSelection( item );
    }

    /**
     * get layout from current session object to determine full size
     * of our list
     */
    public async connect() {
        super.connect();
        const data = await this.genericList.getLayout();
        this.dataModel.total = data.qListObject.qSize.qcy;
    }

    /**
     * search in hypercube, this should interpreted as
     */
    public async search(value: string): Promise<boolean> {
        const search = await this.genericList.searchListObjectFor("/qListObjectDef", value);
        if (!search) {
            return search;
        }
        this.genericList.emit("changed");
        return true;
    }

    /**
     * toggle selection on selected values
     */
    private toggleSelection(item: ListItem) {
        const items: IListItem<EngineAPI.INxCell>[] = Array.isArray(item) ? item : [item];
        const selected = items.map( cell => cell.raw.qElemNumber );

        // at some point we need to call end selections
        // this.genericList.beginSelections(["/qListObjectDef"]);

        this.genericList.selectListObjectValues(
            "/qListObjectDef",
            selected,
            true,
            false
        );
    }

    /** load all items for specific page */
    public async load(start: number, count: number): Promise<IListItem<EngineAPI.INxCell>[]> {
        console.log("LOAD DATA");
        const data = await this.genericList.getListObjectData(
            "/qListObjectDef",
            [
                {
                    qHeight: count,
                    qLeft: 0,
                    qTop: start,
                    qWidth: 1
                }
            ]
        );
        return this.convertDataPage(data);
    }

    /** flatten matrix to resolve a list we could display */
    private convertDataPage(data: EngineAPI.INxDataPage[]): IListItem<EngineAPI.INxCell>[] {
        if ( !Array.isArray(data ) || !data.length ) {
            return [];
        }

        const pageData = data[0].qMatrix;
        const reduced = pageData.reduce<IListItem<EngineAPI.INxCell>[]>(
            (prev, col) => {
                const items = col.map( value => {
                    const item: IListItem<EngineAPI.INxCell> = {
                        label: value.qText,
                        raw: value,
                        icon: this.getIcon( value.qState ),
                        state: this.getState( value.qState )
                    };
                    return item;
                } );
                return prev.concat( ...items );
            },
            []
        );
        return reduced;
    }

    /** register on changed events on session object */
    private registerEvents() {
        this.genericList.on("changed", async () => {
            const data = await this.genericList.getLayout();
            this.dataModel.total = data.qListObject.qSize.qcy;
            this.update$.next();
        });
    }

    /**
     * get icon for state
     */
    private getIcon(state: EngineAPI.NxCellStateType): ItemIcon {
        switch ( state ) {
            case SelectionState.EXCLUDED_SELECTED:
            case SelectionState.SELECTED:
                return ItemIcon.SELECTED;

            case SelectionState.EXCLUDED_LOCKED:
            case SelectionState.LOCKED:
                return ItemIcon.LOCK;

            default:
                return ItemIcon.NONE;
        }
    }

    /**
     * get state for item
     */
    private getState(state: EngineAPI.NxCellStateType): ItemState {
        switch ( state ) {

            case SelectionState.EXCLUDED_LOCKED:
            case SelectionState.EXCLUDED_SELECTED:
            case SelectionState.EXCLUDED:
                return ItemState.EXCLUDED;

            case SelectionState.SELECTED:
            case SelectionState.LOCKED:
                return ItemState.SELECTED;

            case SelectionState.ALTERNATIVE:
                return ItemState.ALTERNATIVE;

            default:
                return ItemState.NONE;
        }
    }

    public acceptListObjectSearch() {
        console.log("acceptListObjectSearch");
        this.genericList.acceptListObjectSearch("/qListObjectDef", true);
    }

    public abortListObjectSearch() {
        console.log("abortListObjectSearch");
        this.genericList.abortListObjectSearch("/qListObjectDef");
    }

}


// ToDo
// bread crum in search