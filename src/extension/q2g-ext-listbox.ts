import { definition } from "./config/definition";
import "./listbox.element";

export = {
    definition: definition,
    initialProperties: { },
    template: '<div></div>',
    support: {
        snapshot: false,
        export: false,
        exportData: false
    },
    init: () => {},
    paint: () => {},
    resize: () => {},
    controller: ["$scope", "$element", ($scope: any, $element) => {
        const id = $scope.layout.qInfo.qId;
        $element.append(`<q2g-ngx-extension object-id=${id}></q2g-ngx-extension>`);
    }]
};
