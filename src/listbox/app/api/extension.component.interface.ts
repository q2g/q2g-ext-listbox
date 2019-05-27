export interface ExtensionComponent {

    /**
     * app model we handle
     *
     * @type {EngineAPI.IGenericObject}
     * @memberof ExtensionComponent
     */
    model: EngineAPI.IGenericObject;

    /**
     * called every time size of the container was changed, this happens
     * if we switch from edit mode to analysis and from analysis to edit mode
     * or if we change cell size in edit mode.
     *
     * @memberof ExtensionComponent
     */
    updateSize(): void;
}
