import { definition } from "./config/definition";
import "./listbox.element";
import * as qlik from "qlik";

export = {
    definition: definition,
    initialProperties: {},
    template: '<div></div>',
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    controller: ["$scope", "$element", ($scope: any, $element) => {

        /** create id if component dosent have one */
        const cell: JQuery = $element.closest('.cell').uniqueId();
        /** this is the extension id which will be used to get correct app model */
        const id = $scope.layout.qInfo.qId;
        /** current mode visualization / edit */
        const mode = qlik.navigation.getMode();
        /** append q2g-ngx-extension wrapper for angular x extensions */
        const extEl: JQuery = $element.append(`<q2g-ngx-extension mode=${mode} object-id=${id} root-cell=${cell.attr('id')}></q2g-ngx-extension>`);
        
        /** watch for changes on mode and pass them to ngx-extension to trigger a rerender */
        $scope.$watch(() => qlik.navigation.getMode(), (cur: string) => {
            window.setTimeout(() => {
                extEl.find('q2g-ngx-extension').attr("mode", cur);
            }, 0)
        });
    }]
};
