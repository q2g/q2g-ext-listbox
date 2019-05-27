import { definition } from "./app/model/definition";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { ListboxModule, EXTENSION_ID } from "./app/listbox.module";
import { environment } from "../environments/environment";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(ListboxModule)
  .catch(err => console.error(err));

export default {
    definition,
    initialProperties: {},
    template: `<${EXTENSION_ID}></${EXTENSION_ID}>`,
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    controller: ["$scope", "$element", ($scope: any, $element) => {
        $element.find(EXTENSION_ID).get(0).model = $scope.component.model.enigmaModel;
    }]
};
