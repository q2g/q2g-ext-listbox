//#region Imports
import { utils, logging, services } from "../node_modules/davinci.js/dist/esm/daVinci";
import * as qvangular from "qvangular";
import * as template from "text!./listbox.extension.html";
import { ListboxDirectiveFactory} from "./directives/listbox/listbox.directive";
import { definition } from "./model/definition";
import { ListExtension } from "./classes/list-extension";
//#endregion

//#region registrate services
const registerService = qvangular.service<services.IRegistrationProvider>("$registrationProvider", services.RegistrationProvider);
registerService.implementObject(qvangular);
//#endregion

//#region Logger
logging.LogConfig.SetLogLevel("*", logging.LogLevel.debug);
//#endregion

//#region registrate directives
var $injector = qvangular.$injector;
utils.checkDirectiveIsRegistrated( $injector, qvangular, "", ListboxDirectiveFactory("Listboxextension"),"ListboxExtension");
//#endregion

export = {
    definition: definition,
    initialProperties: { },
    template: template,
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    controller: ["$scope", function (scope: utils.IVMScope<ListExtension>) {
        scope.vm = new ListExtension(utils.getEnigma(scope));
    }]
};
