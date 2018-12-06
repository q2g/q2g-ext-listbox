export interface IQlikSingleListController {
    model: EngineAPI.IGenericObject;
    selectListObjectCallback(pos: number, event?: JQueryKeyEventObject): void;
    extensionHeaderAccept(): void;
}