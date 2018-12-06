import * as qlik from "qlik";
import { RootExtension } from "./root-extension";

export class ListExtension extends RootExtension {
    constructor(model: EngineAPI.IGenericObject) {
        super(model, qlik);
    }
}