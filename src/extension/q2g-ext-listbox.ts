import { definition } from "./config/definition";
import "./listbox.element";

export = {
    definition: definition,
    initialProperties: {},
    template: '<div></div>',
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    init: ($root) => {
    },
    paint: () => {
    },
    resize: () => {},
    controller: ["$scope", "$element", ($scope: any, $element) => {

        /** 
         * if the element dont have an id, create a new unique id
         * so we could find the element again which is needed to determine 
         * if grid cell size has been changed and need to rerender some stuff like 
         * scrollbars or any other elements which depends on dom element size
         * 
         * or just press F5
         */
        const cell: JQuery = $element.closest('.cell').uniqueId();

        /** this is the extension id which will be used to get correct app model */
        const id = $scope.layout.qInfo.qId;

        // angular 1 Steinzeit Watcher $scope.watch ( width, height ) -> muss als argument mit durchgereicht werden
        $element.append(`<q2g-ngx-extension object-id=${id} root-cell=${cell.attr('id')}></q2g-ngx-extension>`);
    }]
};
