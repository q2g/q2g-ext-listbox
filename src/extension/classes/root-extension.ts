export class RootExtension {

    model: EngineAPI.IGenericObject;
    qlik: RootAPI.IRoot;

    constructor(model:EngineAPI.IGenericObject, qlik: RootAPI.IRoot) {
        this.model = model;
        this.qlik = qlik;
    }

    /**
     * isEditMode
     * checks if extension is in edit mode or in anylyse mode
     */
    public isEditMode() {
        try {
            if (this.qlik.navigation.getMode() === "analysis") {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error("Error in function isEditMode", error);
        }
    }
}