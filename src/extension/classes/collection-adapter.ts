export class CollectionAdapter {

    collections: Array<Array<any>>;

    private _itemsPagingHeight: number = 0;

    public get itemsPagingHeight() : number {
        return this._itemsPagingHeight;
    }

    public set itemsPagingHeight(v : number) {
        this._itemsPagingHeight = v;
    }

    split: number;
    splitmode: 0 | 1;

    constructor(split: number, splitmode: 0 | 1) {
        this.split = split;
        this.splitmode = splitmode;
    }

    calcCollections (collection: any[]) {
        let length = collection.length;
        let countItem = 0;
        let countCol = 0;
        let collectionsAssist;

        collectionsAssist = new Array(this.split);
        for (let index = 0; index < this.split; index++) {
            collectionsAssist[index] = [];
        }
        while (countItem < length) {

            if (this.splitmode === 0) {
                if (countCol%this.split === 0) {
                    countCol = 0;
                }
                collectionsAssist[countCol].push(collection[countItem]);
                countCol++;
            }

            if (this.splitmode === 1) {

                if (countItem >= (this.itemsPagingHeight * (countCol+1))) {
                    countCol++;
                }

                if (countCol >= this.split) {
                    break;
                }

                try {

                    collectionsAssist[countCol].push(collection[countItem]);
                } catch (error) {
                    console.error("error", error);
                }
            }

            countItem++;
        }
        this.collections = collectionsAssist;
        return collectionsAssist;
    }
}