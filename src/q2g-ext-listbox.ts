//#region Imports
import "css!./q2g-ext-listboxExtension.css";
import * as qvangular                   from "qvangular";
import * as qlik                        from "qlik";
import * as template                    from "text!./q2g-ext-listboxExtension.html";
import { utils,
         logging,
         services,
         version }                      from "./node_modules/davinci.js/dist/umd/daVinci";

import { ListboxDirectiveFactory, 
         IProperties}                   from "./q2g-ext-listboxDirective";
//#endregion

//#region registrate services
qvangular.service<services.IRegistrationProvider>("$registrationProvider", services.RegistrationProvider)
.implementObject(qvangular);
//#endregion

//#region Logger
logging.LogConfig.SetLogLevel("*", logging.LogLevel.info);
let logger = new logging.Logger("Main");
//#endregion

//#region registrate directives
var $injector = qvangular.$injector;
utils.checkDirectiveIsRegistrated($injector, qvangular, "", ListboxDirectiveFactory("Listboxextension"),
    "ListboxExtension");
//#endregion

//#region interfaces
interface IDataProperties {
    properties: IProperties;
}
//#endregion

//#region set extension parameters
let parameter = {
    type: "items",
    component: "accordion",
    items: {
        dimensions: {
            uses: "dimensions",
            min: 1,
            max: 1,
            items: {
                nullSuppression: {
                    show: false
                },
                dimensionLimits :{
                    show: false
                }
            }
        },
        sorting: {
            component: "items",
            label: "Sorting",
            grouped: true,
            items: {
                sortmode: {
                    ref: "properties.sortmode",
                    label: "Sorting",
                    component: "switch",
                    type: "boolean",
                    options: [{
                        value: false,
                        label: "individual"
                    }, {
                        value: true,
                        label: "automatic"
                    }],
                    defaultValue: true
                },
                byExpression: {
                    component: "items",
                    grouped: false,
                    items: {
                        byExpression: {
                            ref: "properties.byExpression",
                            label: "sort by Expression",
                            type: "boolean",
                            defaultValue: false
                        },
                        byExpressionFcn: {
                            ref: "properties.byExpressionFcn",
                            type: "string",
                            expression: "optional",
                            show: function (data: IDataProperties) {
                                return data.properties.byExpression;
                            }
                        },
                        byExpressionOrder: {
                            ref: "properties.byExpressionOrder",
                            component: "dropdown",
                            type: "string",
                            options: [{
                                value: "a",
                                label: "ascending"
                            }, {
                                value: "d",
                                label: "descending"
                            }],
                            defaultValue: "a",
                            show: function (data: IDataProperties) {
                                return data.properties.byExpression;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sortmode) {
                            data.properties.byExpression = false;
                        }
                        return !data.properties.sortmode;
                    }
                },
                byFrequency: {
                    component: "items",
                    grouped: false,
                    items: {
                        byState: {
                            ref: "properties.byFrequency",
                            label: "sort by Frequency",
                            type: "boolean",
                            defaultValue: false
                        },
                        byFrequencyOrder: {
                            ref: "properties.byFrequencyOrder",
                            component: "dropdown",
                            type: "string",
                            options: [{
                                value: "a",
                                label: "ascending"
                            }, {
                                value: "d",
                                label: "descending"
                            }],
                            defaultValue: "a",
                            show: function (data: IDataProperties) {
                                return data.properties.byFrequency;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sortmode) {
                            data.properties.byFrequency = false;
                        }
                        return !data.properties.sortmode;
                    }
                },
                byNumeric: {
                    component: "items",
                    grouped: false,
                    items: {
                        byNumeric: {
                            ref: "properties.byNumeric",
                            label: "sort by Numeric",
                            type: "boolean",
                            defaultValue: true
                        },
                        byNumericOrder: {
                            ref: "properties.byNumericOrder",
                            component: "dropdown",
                            type: "string",
                            options: [{
                                value: "a",
                                label: "ascending"
                            }, {
                                value: "d",
                                label: "descending"
                            }],
                            defaultValue: "a",
                            show: function (data: IDataProperties) {
                                return data.properties.byNumeric;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sortmode) {
                            data.properties.byNumeric = true;
                        }
                        return !data.properties.sortmode;
                    }
                },
                byAscii: {
                    component: "items",
                    grouped: false,
                    items: {
                        byAscii: {
                            ref: "properties.byAscii",
                            label: "sort by Ascii",
                            type: "boolean",
                            defaultValue: true
                        },
                        byAsciiOrder: {
                            ref: "properties.byAsciiOrder",
                            component: "dropdown",
                            type: "string",
                            options: [{
                                value: "a",
                                label: "ascending"
                            }, {
                                value: "d",
                                label: "descending"
                            }],
                            defaultValue: "a",
                            show: function (data: IDataProperties) {
                                return data.properties.byAscii;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sortmode) {
                            data.properties.byAscii = true;
                        }
                        return !data.properties.sortmode;
                    }
                },
                byState: {
                    component: "items",
                    grouped: false,
                    items: {
                        byState: {
                            ref: "properties.byState",
                            label: "sort by State",
                            type: "boolean",
                            defaultValue: true
                        },
                        byStateOrder: {
                            ref: "properties.byStateOrder",
                            component: "dropdown",
                            type: "string",
                            options: [{
                                value: "a",
                                label: "ascending"
                            }, {
                                value: "d",
                                label: "descending"
                            }],
                            defaultValue: "a",
                            show: function (data: IDataProperties) {
                                return data.properties.byState;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sortmode) {
                            data.properties.byState = true;
                        }
                        return !data.properties.sortmode;
                    }
                },
                byLoadOrder: {
                    component: "items",
                    grouped: false,
                    items: {
                        byLoadOrder: {
                            ref: "properties.byLoadOrder",
                            label: "sort by Load Order",
                            type: "boolean",
                            defaultValue: false
                        },
                        byLoadOrderOrder: {
                            ref: "properties.byLoadOrderOrder",
                            component: "dropdown",
                            type: "string",
                            options: [{
                                value: "a",
                                label: "ascending"
                            }, {
                                value: "d",
                                label: "descending"
                            }],
                            defaultValue: "a",
                            show: function (data: IDataProperties) {
                                return data.properties.byLoadOrder;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sortmode) {
                            data.properties.byLoadOrder = false;
                        }
                        return !data.properties.sortmode;
                    }
                },
            }
        },
        settings: {
            uses: "settings",
            items: {
                configuration: {
                    type: "items",
                    label: "Configuration",
                    grouped: true,
                    items: {
                        orientation: {
                            type: "items",
                            label: "orientation",
                            grouped: false,
                            items: {
                                horizontalmode: {
                                    ref: "properties.horizontalmode",
                                    label: "switch orientation",
                                    component: "switch",
                                    type: "boolean",
                                    options: [{
                                        value: false,
                                        label: "vertical"
                                    }, {
                                        value: true,
                                        label: "horizontal"
                                    }],
                                    defaultValue: false
                                },
                                fieldSize: {
                                    ref: "properties.fieldSize",
                                    label: "Field Size",
                                    type: "number",
                                    defaultValue: 80,
                                    show: function (data: IDataProperties) {
                                        if (!data.properties.horizontalmode) {
                                            data.properties.fieldSize = 80;
                                        }
                                        return data.properties.horizontalmode;
                                    }
                                },
                            }
                        },
                        split: {
                            type: "items",
                            label: "Orientation",
                            grouped: false,
                            items: {
                                splitmode: {
                                    ref: "properties.splitmode",
                                    label: "switch to split mode",
                                    component: "switch",
                                    type: "boolean",
                                    options: [{
                                        value: true,
                                        label: "use split"
                                    }, {
                                        value: false,
                                        label: "no spit"
                                    }],
                                    defaultValue: false
                                },
                                splitcolumns: {
                                    ref: "properties.splitcolumns",
                                    label: "how many columns",
                                    type: "number",
                                    defaultValue: "1",
                                    show: function (data: IDataProperties) {
                                        if (!data.properties.splitmode) {
                                            data.properties.splitcolumns = 1;
                                        }
                                        data.properties.splitcolumns = Math.round(data.properties.splitcolumns);
                                        return data.properties.splitmode;
                                    }
                                },
                                splitorientation: {
                                    ref: "properties.splitorientation",
                                    label: "switch betweent the order",
                                    component: "switch",
                                    type: "boolean",
                                    options: [{
                                        value: true,
                                        label: "horizontal"
                                    }, {
                                        value: false,
                                        label: "vertical"
                                    }],
                                    defaultValue: false,
                                    show: function (data: IDataProperties) {
                                        if (!data.properties.splitmode) {
                                            data.properties.splitorientation = false;
                                        }
                                        return data.properties.splitmode;
                                    }
                                },
                            }
                        }
                    }
                }
            }
        }
    }
};
//#endregion

class RootExtension {

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

class ListExtension extends RootExtension {

    constructor(model: EngineAPI.IGenericObject) {
        super(model, qlik);
    }

}

export = {
    definition: parameter,
    initialProperties: { },
    template: template,
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    paint: () => {
        //
    },
    resize: () => {
        //
    },
    controller: ["$scope", function (scope: utils.IVMScope<ListExtension>) {
        console.log("Extension is using daVinci.js Verions: " + version);
        scope.vm = new ListExtension(utils.getEnigma(scope));
    }]
};




