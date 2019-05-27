import { definition } from "./app/model/definition";
import * as qlik from "qlik";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { ListboxModule } from "./app/listbox.module";
import { environment } from "../environments/environment";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(ListboxModule)
  .catch(err => console.error(err));

export default {
    definition,
    initialProperties: {},
    template: "<div></div>",
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    controller: ["$scope", "$element", ($scope: any, $element) => {
        /** create id if component dosent have one */
        const cell: JQuery = $element.closest(".cell").uniqueId();
        /** this is the extension id which will be used to get correct app model */
        const id = $scope.layout.qInfo.qId;
        /** current mode visualization / edit */
        const mode = "edit"; // || qlik.navigation.getMode();
        /** append q2g-ngx-extension wrapper for angular x extensions */
        // tslint:disable-next-line: max-line-length
        const extEl: JQuery = $element.append(`<q2g-ngx-extension mode=${mode} object-id=${id} root-cell=${cell.attr("id")}></q2g-ngx-extension>`);
        /** watch for changes on mode and pass them to ngx-extension to trigger a rerender */
        /*
        $scope.$watch(() => qlik.navigation.getMode(), (cur: string) => {
            window.setTimeout(() => {
                extEl.find("q2g-ngx-extension").attr("mode", cur);
            }, 0);
        });
        */
    }]
};
