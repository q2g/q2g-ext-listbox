import { IDataProperties } from "../api/data-properties.interface";
import { Sort } from "../api/porperties.interface";

export const definition = {
    type: "items",
    component: "accordion",
    items: {
        dimensions: {
            uses: "dimensions",
            min: 1,
            items: {
                nullSuppression: {
                    show: false
                },
                dimensionLimits: {
                    show: false
                },
                dimensionMeasure: {
                    type: "string",
                    component: "expression",
                    ref: "qAttributeExpressions.0.qExpression",
                    label: "Dimension Measure",
                    defaultValue: ""
                }
            }
        },
        sorting: {
            component: "items",
            label: "Sorting",
            grouped: true,
            items: {
                sortmode: {
                    ref: "properties.sort.mode",
                    label: "Sorting",
                    component: "switch",
                    type: "boolean",
                    options: [{
                        value: Sort.Mode.INDIVIDUAL,
                        label: "individual"
                    }, {
                        value: Sort.Mode.AUTOMATIC,
                        label: "automatic"
                    }],
                    defaultValue: Sort.Mode.AUTOMATIC
                },
                byExpression: {
                    component: "items",
                    grouped: false,
                    items: {
                        byExpression: {
                            ref: "properties.sort.by.expression.enabled",
                            label: "sort by Expression",
                            type: "boolean",
                            defaultValue: false
                        },
                        byExpressionFcn: {
                            ref: "properties.sort.by.expressionFcn.value",
                            type: "string",
                            expression: "optional",
                            show: function (data: IDataProperties) {
                                return data.properties.sort.by.expression.enabled;
                            }
                        },
                        byExpressionOrder: {
                            ref: "properties.sort.by.expression.orderBy",
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
                                return data.properties.sort.by.expression.orderBy;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sort.mode === Sort.Mode.AUTOMATIC) {
                            data.properties.sort.by.expression.enabled = false;
                        }
                        return data.properties.sort.mode === Sort.Mode.INDIVIDUAL;
                    }
                },
                byFrequency: {
                    component: "items",
                    grouped: false,
                    items: {
                        byState: {
                            ref: "properties.sort.by.frequency.enabled",
                            label: "sort by Frequency",
                            type: "boolean",
                            defaultValue: false
                        },
                        byFrequencyOrder: {
                            ref: "properties.sort.by.frequency.orderBy",
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
                                return data.properties.sort.by.frequency.orderBy;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sort.mode === Sort.Mode.AUTOMATIC) {
                            data.properties.sort.by.frequency.enabled = false;
                        }
                        return data.properties.sort.mode === Sort.Mode.INDIVIDUAL;
                    }
                },
                byNumeric: {
                    component: "items",
                    grouped: false,
                    items: {
                        byNumeric: {
                            ref: "properties.sort.by.numeric.enabled",
                            label: "sort by Numeric",
                            type: "boolean",
                            defaultValue: true
                        },
                        byNumericOrder: {
                            ref: "properties.sort.by.numeric.orderBy",
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
                                return data.properties.sort.by.numeric.orderBy;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sort.mode === Sort.Mode.AUTOMATIC) {
                            data.properties.sort.by.numeric.enabled = true;
                        }
                        return data.properties.sort.mode === Sort.Mode.INDIVIDUAL;
                    }
                },
                byAscii: {
                    component: "items",
                    grouped: false,
                    items: {
                        byAscii: {
                            ref: "properties.sort.by.ascii.enabled",
                            label: "sort by Ascii",
                            type: "boolean",
                            defaultValue: true
                        },
                        byAsciiOrder: {
                            ref: "properties.sort.by.ascii.orderBy",
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
                                return data.properties.sort.by.ascii.orderBy;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sort.mode === Sort.Mode.AUTOMATIC) {
                            data.properties.sort.by.ascii.enabled = true;
                        }
                        return data.properties.sort.mode === Sort.Mode.INDIVIDUAL;
                    }
                },
                byState: {
                    component: "items",
                    grouped: false,
                    items: {
                        byState: {
                            ref: "properties.sort.by.state.enabled",
                            label: "sort by State",
                            type: "boolean",
                            defaultValue: true
                        },
                        byStateOrder: {
                            ref: "properties.sort.by.state.orderBy",
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
                                return data.properties.sort.by.state.orderBy;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sort.mode === Sort.Mode.AUTOMATIC) {
                            data.properties.sort.by.state.enabled = true;
                        }
                        return data.properties.sort.mode === Sort.Mode.INDIVIDUAL;
                    }
                },
                byLoadOrder: {
                    component: "items",
                    grouped: false,
                    items: {
                        byLoadOrder: {
                            ref: "properties.sort.by.loadOrder.enabled",
                            label: "sort by Load Order",
                            type: "boolean",
                            defaultValue: false
                        },
                        byLoadOrderOrder: {
                            ref: "properties.sort.by.loadOrder.orderBy",
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
                                return data.properties.sort.by.loadOrder.orderBy;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.properties.sort.mode === Sort.Mode.AUTOMATIC) {
                            data.properties.sort.by.loadOrder.enabled = false;
                        }
                        return data.properties.sort.mode === Sort.Mode.INDIVIDUAL;
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
                                orientation: {
                                    ref: "properties.orientation",
                                    label: "switch orientation",
                                    component: "switch",
                                    type: "boolean",
                                    options: [{
                                        value: 0,
                                        label: "vertical"
                                    }, {
                                        value: 1,
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
                            },
                            show: function (data: IDataProperties) {
                                if (data.qHyperCubeDef.qDimensions.length === 0) {
                                    return true;
                                }
                                return false;
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
                                    defaultValue: 1,
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
                            },
                            show: function (data: IDataProperties) {
                                if (data.qHyperCubeDef.qDimensions.length === 0) {
                                    return true;
                                }
                                return false;
                            }
                        }
                    },
                    show: function (data: IDataProperties) {
                        if (data.qHyperCubeDef.qDimensions.length === 1) {
                            return true;
                        }
                        return false;
                    }
                }
            }
        }
    }
};
