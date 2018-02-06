//#region
import { logging,
         utils,
         directives }           from "../node_modules/davinci.js/dist/umd/daVinci";
import * as template            from "text!./q2g-ext-listboxDirective.html";
import { RootSingleList, IQlikSingleListController } from "../node_modules/davinci.js/src/utils/rootclasses";

import { ListViewDirectiveFactory } from "../node_modules/davinci.js/src/directives/listview";
//#endregion

//#region
interface ICreateDim {
    qGroupFieldDefs: Array<string>;
    qFallbackTitle: string;
}
//#endregion

interface ITest {
    test: void;
}

class ListboxController extends RootSingleList implements ng.IController, IQlikSingleListController {

    //#region variables
    field: string = "";
    focusedPositionValues: number = -1;
    list: utils.IQ2gListAdapter;
    listObject: EngineAPI.IGenericObject;
    lockMenuListValues: boolean = false;
    headerInput: string = "";
    horizontalMode:boolean = false;
    itemHeight: number = 31;
    menuList: Array<utils.IMenuElement>;
    modalState: boolean = false;
    selectedDimension: Array<string> = [];
    showFocusedDimension:boolean = false;
    showHeaderButtons: boolean = false;
    showHeaderInput: boolean = false;
    statusText: string = "";
    title: string = "list box";
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
                        if (typeof(res.qHyperCube.qDimensionInfo[0]) !== "undefined"
                            && that.field !== res.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0]) {
                            that.createListObject(res);
                        }
                    })
                .catch((error) => {
                    that.logger.error("error in changed - getLayout", error);
                });

                this.getProperties()
                    .then((props) => {
                        that.setProperties(props);
                    })
                .catch((error) => {
                    that.logger.error("error in changed - getProperties", error);
                });
            });
            v.emit("changed");
        }
    }
    //#endregion


    static $inject = ["$timeout", "$element", "$scope"];

    constructor(timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope) {
        super(timeout, element, scope);
        this.initMenuElements();
    }

    //#region public functions
    /**
     * selects item from the list
     * @param pos position to be selected
     * @param assistItemsPagingTop top position of the page
     */
    selectListObjectCallback(pos: number, event?: JQueryKeyEventObject) {
        let assistItemsPagingTop = this.list.itemsPagingTop;
        this.showFocusedDimension = true;
        this.showHeaderButtons = true;

        if (this.modalState) {
            this.selectItems(pos, assistItemsPagingTop)
            .catch((err: Error) => {
                this.logger.error("ERROR in selectListObjectCallback", err);
            });
            return;
        }
        this.listObject.beginSelections(["/qListObjectDef"])
            .then(() => {
                this.modalState = true;
                return this.selectItems(pos, assistItemsPagingTop);
            })
        .catch((err: Error) => {
            this.logger.error("ERROR in selectListObjectCallback", err);
        });
    }

    /**
     * callback when enter on input field
     */
    extensionHeaderAccept() {
        //
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
                this.listObject.endSelections(true);
                break;
            case "Cancle Selection":
                this.showHeaderButtons = false;
                this.showHeaderInput = false;
                this.modalState = false;
                this.listObject.endSelections(false);
                break;
            case "clear":
                this.listObject.clearSelections("/qListObjectDef");
                break;
            case "Select all":
                this.listObject.selectListObjectAll("/qListObjectDef");
                break;
            case "Select possible":
                this.listObject.selectListObjectPossible("/qListObjectDef");
                break;
            case "Select alternative":
                this.listObject.selectListObjectAlternative("/qListObjectDef");
                break;
            case "Select excluded":
                this.listObject.selectListObjectExcluded("/qListObjectDef");
                break;
            case "Clear all selections":
                this.model.app.clearAll(true);
                break;
            case "Lock dimension":
                this.lockMenuListValues = true;
                (this.listObject.lock as any)("/qListObjectDef");
                break;
            case "Scramble Values":
                (this.model.app as any).scramble(this.selectedDimension);
                break;

        }
    }
    //#endregion

    //#region private functions
    private createListObject(objectLayout: EngineAPI.IGenericHyperCubeLayout) {

            this.field = objectLayout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs[0];

            let qFieldDefs = objectLayout.qHyperCube.qDimensionInfo[0].qGroupFieldDefs;
            let qFieldLabels = objectLayout.qHyperCube.qDimensionInfo[0].qFallbackTitle;


            if (this.listObject) {
                this.model.app.destroySessionObject(this.listObject.id)
                    .then(() => {
                        this.createValueListSessionObjectAssist(qFieldLabels, qFieldDefs);
                    })
                    .catch((err: Error) => {
                        this.logger.error("Error in createValueListSessionObjcet", err);
                    });
            } else {
                this.createValueListSessionObjectAssist(qFieldLabels, qFieldDefs);
            }
    }

    /**
     * creates the session object for the selected dimension by dimension name assist
     * @param dimensionName name of the diminsion the new session object should be create for
     * @param dimensionFieldDefs definition of the diminsion the new session object should be create for
     */
    private createValueListSessionObjectAssist(dimensionName: string, dimensionFieldDefs: Array<string>): void {
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
                            "qSortByState": 0,
                            "qSortByFrequency": 0,
                            "qSortByNumeric": 1,
                            "qSortByAscii": 0,
                            "qSortByLoadOrder": 0,
                            "qSortByExpression": 0
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
                    this.list = new utils.Q2gListAdapter(
                        new utils.Q2gListObject(
                            this.listObject),
                            res.qListObject.qDimensionInfo.qCardinal,
                        res.qListObject.qDimensionInfo.qCardinal,
                        "qlik"
                    );

                    let that = this;
                    genericObject.on("changed", function () {
                        that.list.obj.emit("changed", that.list.itemsPagingHeight);
                        genericObject.getLayout().then((res: EngineAPI.IGenericObjectProperties) => {

                            console.log("value", that.list);
                            that.checkAvailabilityOfMenuListElements(res.qListObject.qDimensionInfo);
                            // that.checkIfDimIsLocked(res.qListObject.qDimensionInfo);
                        });
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
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: false,
            icon: "unlock",
            name: "Lock dimension",
            hasSeparator: false,
            type: "menu"
        });
        this.menuList.push({
            buttonType: "",
            isVisible: true,
            isEnabled: false,
            icon: "debug",
            name: "Scramble Values",
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
                    console.log("pos", pos);
                    console.log("this.list.itemsPagingTop", this.list.itemsPagingTop);
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
    //#endregion





    setProperties(properties: any) {
        this.changeOrientation(properties.properties.horizontalmode);
    }

    changeOrientation(horizontalMode: boolean) {
        if(horizontalMode) {
            this.horizontalMode = false;
            this.itemHeight = 30;
            return;
        }
        this.horizontalMode = true;
        this.itemHeight = 80;
        return;
    }
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
            }
        };
    };
}