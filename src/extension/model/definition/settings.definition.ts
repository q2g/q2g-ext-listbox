import { IDataProperties } from "api/data-properties.interface";

export const settings = {
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
                    }
                }
            }
        }
    }
}
