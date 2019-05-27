import { map } from '../utils/map.decorator';

type Alignment = "vertical" | "horizontal";

export class ListProperties {

    private _itemAlign: Alignment = "vertical";

    private _itemSize = 30;

    private _splitActive = false;

    private _splitAlign: Alignment = "vertical";

    private _splitCount = 1;

    @map({
        0: "vertical",
        1: "horizontal"
    })
    public set itemAlign(align: Alignment) {
        this._itemAlign = align;
    }

    public get itemAlign(): Alignment {
        return this._itemAlign;
    }

    public set itemSize(size: number) {
        this._itemSize = size;
    }

    public get itemSize(): number {
        return this._itemSize;
    }

    public set splitActive(active: boolean) {
        this._splitActive = active;
    }

    public get splitActive(): boolean {
        return this._splitActive;
    }

    @map({
        0: "vertical",
        1: "horizontal"
    })
    public set splitAlign(align: Alignment) {
        this._splitAlign = align;
    }

    public get splitAlign(): Alignment {
        return this._splitAlign;
    }

    public set splitCols(count: number) {
        this._splitCount = count;
    }

    public get splitCols(): number {
        return this._splitCount;
    }

    public toString(): string {
        return JSON.stringify({
            itemAlign: this.itemAlign,
            itemSize: this.itemSize,
            splitActive: this.splitActive,
            splitAlign: this.splitAlign,
            splitCols: this.splitCols,
        });
    }
}
