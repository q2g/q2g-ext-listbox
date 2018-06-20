//#region Imports
import { logging,
         utils,
         directives }               from "./node_modules/davinci.js/dist/umd/daVinci";
import { RootSingleList}            from "./node_modules/davinci.js/dist/umd/utils/rootclasses";
import { ListViewDirectiveFactory } from "./node_modules/davinci.js/dist/umd/directives/listview";
import * as template                from "text!./q2g-ext-listboxDirective.html";
//#endregion

//#region Interfaces

export interface IProperties {
    horizontalmode: boolean;
    splitcolumns: number;
    byState: boolean;
    byFrequency: boolean;
    byNumeric: boolean;
    byAscii: boolean;
    byLoadOrder: boolean;
    byExpression: boolean;
    byStateOrder: string;
    byFrequencyOrder: string;
    byNumericOrder: string;
    byAsciiOrder: string;
    byLoadOrderOrder: string;
    byExpressionOrder: string;
    byExpressionFcn: string;
    fieldSize: number;
    splitmode: boolean;
    splitorientation: boolean;
    sortmode: boolean;
}

interface IQlikSingleListController {
    model: EngineAPI.IGenericObject;
    selectListObjectCallback(pos: number, event?: JQueryKeyEventObject): void;
    extensionHeaderAccept(): void;
}

//#endregion

class ListboxController extends RootSingleList implements ng.IController, IQlikSingleListController {

    //#region variables
    field: string = "";
    focusedPositionValues: number = -1;
    list: utils.IQ2gListAdapter;
    listObject: EngineAPI.IGenericObject;
    lockMenuListValues: boolean = false;
    horizontalMode:boolean = false;
    itemHeight: number = 31;
    menuList: Array<utils.IMenuElement>;
    modalState: boolean = false;
    properties: IProperties;
    selectedDimension: Array<string> = [];
    showFocusedField:boolean = false;
    showHeaderButtons: boolean = false;
    showHeaderInput: boolean = false;
    statusText: string = "";
    title: string = "list box";
    collectionAdapter: CollectionAdapter;
    //#endregion

    //#region headerInput
    private _headerInput: string;
    public get headerInput() : string {
        return this._headerInput;
    }
    public set headerInput(v : string) {
        if (v !== this.headerInput && typeof(this.list.obj) !== "undefined") {
            try {
                this.list.itemsPagingTop = 0;
                this._headerInput = v;
                this.list.obj.searchFor(!v? "": v)
                    .then(() => {
                        return this.listObject.getLayout();
                    })
                    .then((res: EngineAPI.IGenericObjectProperties) => {
                        this.list.itemsCounter = res.qListObject.qDimensionInfo.qCardinal;
                    })
                .catch((e: Error) => {
                    throw e;
                });
                return;
            } catch (e) {
                this.logger.error("error in setter of headerInput 3", e);
            }
        }
    }
    //#endregion

    //#region logger
    private _logger: logging.Logger;
    private get logger(): logging.Logger {
        if (!this._logger) {
            try {
                this._logger = new logging.Logger("ListboxController");
            } catch (e) {
                console.error("ERROR in create logger instance", e);
            }
        }
        return this._logger;
    }
    //#endregion

    //#region mode
    private _model: EngineAPI.IGenericObject;
    public get model() : EngineAPI.IGenericObject {
        return this._model;
    }
    public set model(v : EngineAPI.IGenericObject) {
        if (v !== this._model) {
            this._model = v;
            let that = this;
            v.on("changed", function() {
                this.getLayout()
                    .then((res) => {

                        if (typeof(that.properties) === "undefined") {
                            that.setProperties(res.properties);
                        }
                        if ((typeof(res.qHyperCube.qDimensionInfo[0]) !== "undefined"
                                && that.field !== res.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0])
                                || JSON.stringify(that.properties) !== JSON.stringify(res.properties)) {
                            that.setProperties(res.properties);
                            that.createListObject(res);
                        }
                    })
                .catch((error) => {
                    that.logger.error("error in changed - getProperties", error);
                });
            });
            v.emit("changed");
        }
    }
    //#endregion

    //#region itemsPageSize
    private _itemsPageSize = 0;
    public get itemsPageSize() : number {
        return this._itemsPageSize;
    }
    public set itemsPageSize(v : number) {
        this._itemsPageSize = v;

        if (typeof(this.collectionAdapter) !== "undefined") {
            try {
                this.collectionAdapter.itemsPagingHeight = v/(this.properties.splitcolumns?this.properties.splitcolumns:1);
            } catch (error) {
                this.logger.error("ERRORin setter of itemsPageSize", error);
            }
        }

        if (typeof(this.list) !== "undefined") {
            this.list.itemsPagingHeight = v;
        }
    }
    //#endregion

    static $inject = ["$timeout", "$element", "$scope"];

    constructor(timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope) {
        super(timeout, element, scope);
        this.initMenuElements();


        $(document).on("click", (e: JQueryEventObject) => {
            try {
                if (element.find(e.target).length === 0) {
                    this.showFocusedField = false;
                    this.showHeaderButtons = false;
                    this.showHeaderInput = false;
                    this.headerInput= "";
                    this.timeout();
                }
            } catch (e) {
                this.logger.error("Error in Constructor with click event", e);
            }
        });
    }

    //#region public functions

    /**
     * selects item from the list
     * @param pos position to be selected
     * @param assistItemsPagingTop top position of the page
     */
    selectListObjectCallback(pos: number, event?: JQueryKeyEventObject, index?: number) {
        let assistItemsPagingTop = this.list.itemsPagingTop;
        this.showFocusedField = true;
        this.showHeaderButtons = true;
        let absPosition = 0;
        
        if (this.properties.splitorientation) {
            absPosition = index + (this.properties.splitcolumns * pos);
        } else {
            absPosition = pos + (this.collectionAdapter.itemsPagingHeight * index);
        }

        if (this.modalState) {
            this.selectItems(absPosition, assistItemsPagingTop)
            .catch((err: Error) => {
                this.logger.error("ERROR in selectListObjectCallback", err);
            });
            return;
        }
        this.listObject.beginSelections(["/qListObjectDef"])
            .then(() => {
                this.modalState = true;
                return this.selectItems(absPosition, assistItemsPagingTop);
            })
        .catch((err: Error) => {
            this.logger.error("ERROR in selectListObjectCallback", err);
        });
    }

    /**
     * callback when enter on input field
     */
    extensionHeaderAccept() {
        this.list.obj.acceptListObjectSearch(false)
            .then(() => {
                this.showHeaderInput = false;
                this.headerInput = "";
            }).catch((error) => {
                this.logger.error("Error in setter of input Accept Dimension", error);
            });
    }

    /**
     * function which gets called, when the buttons of the menu list gets hit
     * @param item neme of the nutton which got activated
     */
    menuListActionCallback(item: string) {
        switch (item) {
            case "Confirm Selection":
                this.showHeaderButtons = false;
                this.showHeaderInput = false;
                this.modalState = false;
                this.listObject.endSelections(true)
                    .catch((error) => {
                        this.logger.error("ERROR in menuListActionCallback", error)
                    });
                break;
            case "Cancle Selection":
                this.showHeaderButtons = false;
                this.showHeaderInput = false;
                this.modalState = false;
                this.listObject.endSelections(false)
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
            case "clear":
                this.listObject.clearSelections("/qListObjectDef")
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
            case "Select all":
                this.listObject.selectListObjectAll("/qListObjectDef")
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
            case "Select possible":
                this.listObject.selectListObjectPossible("/qListObjectDef")
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
            case "Select alternative":
                this.listObject.selectListObjectAlternative("/qListObjectDef")
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
            case "Select excluded":
                this.listObject.selectListObjectExcluded("/qListObjectDef")
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
            case "Clear all selections":
                this.model.app.clearAll(true)
                .catch((error) => {
                    this.logger.error("ERROR in menuListActionCallback", error)
                });
                break;
        }
    }

    /**
     * shortcuthandler to clears the made selection
     * @param objectShortcut object wich gives you the shortcut name and the element, from which the shortcut come from
     */
    shortcutHandler(shortcutObject: directives.IShortcutObject, domcontainer: utils.IDomContainer) {
        switch (shortcutObject.name) {
            //#region escList
            case "escList":
                try {
                    if (this.headerInput === "") {
                        this.showHeaderInput = false;
                    }
                    return true;
                } catch (e) {
                    this.logger.error("Error in shortcutHandlerExtensionHeader", e);
                    return false;
                }
            //#endregion
        }
    }

    //#endregion

    //#region private functions

    private createListObject(objectLayout: EngineAPI.IGenericHyperCubeLayout) {

            this.field = objectLayout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];

            let qFieldDefs = objectLayout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs;
            let qFieldLabels = objectLayout.qHyperCube.qDimensionInfo[0].qFallbackTitle;

            this.createValueListSessionObjectAssist(qFieldLabels, qFieldDefs);
    }

    private setSortOrderByProperty(sort: boolean, direction: string): 1 | 0 | -1 {

        return sort?(direction==="a"?1:-1):0;
    }

    /**
     * creates the session object for the selected dimension by dimension name assist
     * @param dimensionName name of the diminsion the new session object should be create for
     * @param dimensionFieldDefs definition of the diminsion the new session object should be create for
     */
    private createValueListSessionObjectAssist(dimensionName: string, dimensionFieldDefs: Array<string>): void {

        this.title = dimensionName;

        var parameter: EngineAPI.IGenericObjectProperties = {
            "qInfo": {
                "qType": "ListObject"
            },
            "qListObjectDef": {
                "qStateName": "$",
                "qLibraryId": "",
                "qDef": {
                    "qFieldDefs": dimensionFieldDefs,
                    "qGrouping": "N",
                    "autoSort": false,
                    "qActiveField": 0,
                    "qFieldLabels": [dimensionName],
                    "qSortCriterias": [
                        {
                            "qSortByState": this.setSortOrderByProperty(this.properties.byState, this.properties.byStateOrder),
                            "qSortByFrequency": this.setSortOrderByProperty(this.properties.byFrequency, this.properties.byFrequencyOrder),
                            "qSortByNumeric": this.setSortOrderByProperty(this.properties.byNumeric, this.properties.byNumericOrder),
                            "qSortByAscii": this.setSortOrderByProperty(this.properties.byAscii, this.properties.byAsciiOrder),
                            "qSortByLoadOrder": this.setSortOrderByProperty(this.properties.byLoadOrder, this.properties.byLoadOrderOrder),
                            "qSortByExpression": this.setSortOrderByProperty(this.properties.byExpression,
                                this.properties.byExpressionOrder),
                            "qExpression": this.properties.byExpression?this.properties.byExpressionFcn:""
                        }
                        ]
                },
                "qAutoSortByState": {
                    "qDisplayNumberOfRows": -1
                },
                "qFrequencyMode": "EQ_NX_FREQUENCY_NONE",
                "qShowAlternatives": true,
                "qInitialDataFetch": [
                    {
                        "qTop": 0,
                        "qLeft": 0,
                        "qHeight": 0,
                        "qWidth": 1
                    }
                ]
            },
            "description": "Description of the list object"
        };

        this.model.app.createSessionObject(parameter)
            .then((genericObject: EngineAPI.IGenericObject) => {
                this.listObject = genericObject;

                genericObject.getLayout().then((res: EngineAPI.IGenericObjectProperties) => {

                    this.collectionAdapter = new CollectionAdapter(this.properties.splitcolumns,this.properties.splitorientation?0:1);

                    this.list = new utils.Q2gListAdapter(
                        new utils.Q2gListObject(
                            this.listObject),
                            res.qListObject.qDimensionInfo.qCardinal,
                        res.qListObject.qDimensionInfo.qCardinal,
                        "qlik"
                    );
                    try {
                        this.collectionAdapter.itemsPagingHeight = this.itemsPageSize/
                        (this.properties.splitcolumns?this.properties.splitcolumns:1);
                    } catch (error) {
                        this.logger.error("ERROR in createValueListSessionObjectAssist", error);
                    }

                    let that1 = this;
                    this.list.obj.on("changeData", function () {
                        that1.collectionAdapter.calcCollections(that.list.collection);
                        that1.timeout();
                    });

                    let that = this;
                    genericObject.on("changed", function () {
                        that.list.obj.emit("changed", that.itemsPageSize);

                        that.checkAvailabilityOfMenuListElements(res.qListObject.qDimensionInfo);

                        genericObject.getLayout()
                        .catch((error) => {
                            this.logger.error("ERROR in createValueListSessionObjectAssist", error);
                        })
                    });
                    genericObject.emit("changed");

                });
            })
            .catch((err: Error) => {
                this.logger.error("ERROR", err);
            });
    }

    /**
     * fills the Menu with Elements
     */
    private initMenuElements(): void {
        this.menuList = [];
        this.menuList.push({
            buttonType: "success",
            isVisible: true,
            isEnabled: false,
            icon: "tick",
            name: "Confirm Selection",
            hasSeparator: false,
            type: "menu"

        });
        this.menuList.push({
            buttonType: "danger",
            isVisible: true,
            isEnabled: false,
            icon: "close",
            name: "Cancle Selection",
            hasSeparator: true,
            type: "menu"
        });
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: false,
            icon: "clear-selections",
            name: "clear",
            hasSeparator: false,
            type: "menu"
        });
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: true,
            icon: "select-all",
            name: "Select all",
            hasSeparator: false,
            type: "menu"
        });
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: false,
            icon: "select-possible",
            name: "Select possible",
            hasSeparator: false,
            type: "menu"
        });
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: true,
            icon: "select-alternative",
            name: "Select alternative",
            hasSeparator: false,
            type: "menu"
        });
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: true,
            icon: "select-excluded",
            name: "Select excluded",
            hasSeparator: false,
            type: "menu"
        });
    }

    /**
     * selects item from the list
     * @param pos position to be selected
     * @param assistItemsPagingTop top position of the page
     */
    private selectItems(pos: number, assistItemsPagingTop: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.listObject.selectListObjectValues("/qListObjectDef", (this.list.collection[pos].id as any), true)
                .then(() => {
                    this.focusedPositionValues = pos + this.list.itemsPagingTop;
                    this.list.itemsPagingTop = assistItemsPagingTop;
                    this.statusText = "Dimension " + this.list.collection[pos].title + " gewählt";
                    resolve(true);
                })
            .catch((error: Error) => {
                reject(error);
            });
        });
    }

    /**
     * checks if the list elements can be selected
     * @param object Layout object of the hypercube
     */
    private checkAvailabilityOfMenuListElements(object: any): void {

        // select-excluded
        this.menuList[6].isEnabled = !(object.qStateCounts.qExcluded > 0 || object.qStateCounts.qAlternative > 0);

        // select-alternative
        this.menuList[5].isEnabled = !(object.qStateCounts.qExcluded > 0 || object.qStateCounts.qAlternative > 0);

        // select - possible
        this.menuList[4].isEnabled = !(object.qStateCounts.qOption > 0);

        // select - all
        this.menuList[3].isEnabled = !(object.qStateCounts.qSelected + object.qStateCounts.qSelectedExcluded
                !== object.qCardinal
            || object.qStateCounts.qOption
                === object.qCardinal);

        // clear-selections
        this.menuList[2].isEnabled = !(object.qStateCounts.qSelected > 0);

        this.menuList = JSON.parse(JSON.stringify(this.menuList));
    }

    /**
     * sets the properties, and maks adjustments according to the properties
     * @param properties properties from the engine model
     */
    private setProperties(properties: IProperties) {
        this.properties = JSON.parse(JSON.stringify(properties));
        if (!properties.splitmode) {
            this.properties.splitcolumns = 1;
        }
        this.changeOrientation();
    }

    /**
     * sets default values for the orientation
     */
    private changeOrientation() {
        if(this.properties.horizontalmode) {
            this.itemHeight = this.properties.fieldSize;
            return;
        }
        this.itemHeight = 30;
        return;
    }

    //#endregion

}

export function ListboxDirectiveFactory(rootNameSpace: string): ng.IDirectiveFactory {
    "use strict";
    return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
        return {
            restrict: "E",
            replace: true,
            template: utils.templateReplacer(template, rootNameSpace),
            controller: ListboxController,
            controllerAs: "vm",
            scope: {},
            bindToController: {
                model: "<",
                theme: "<?",
                editMode: "<?"
            },
            compile: ():void => {
                utils.checkDirectiveIsRegistrated($injector, $registrationProvider, rootNameSpace,
                    directives.ListViewDirectiveFactory(rootNameSpace), "Listview");
                utils.checkDirectiveIsRegistrated($injector, $registrationProvider, rootNameSpace,
                    directives.ExtensionHeaderDirectiveFactory(rootNameSpace), "ExtensionHeader");
                utils.checkDirectiveIsRegistrated($injector, $registrationProvider, rootNameSpace,
                    directives.ShortCutDirectiveFactory(rootNameSpace), "Shortcut");
            }
        };
    };
}

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
