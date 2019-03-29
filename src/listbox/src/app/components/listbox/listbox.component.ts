import { Component, OnInit, Input } from '@angular/core';
import { ExtensionComponent } from '../../api/extension.component.interface';

@Component({
    selector: 'q2g-listbox',
    templateUrl: 'listbox.component.html'
})
export class ListboxComponent implements OnInit, ExtensionComponent {

    @Input()
    public set model(data: any) {
        console.log("set a model");
    }

    ngOnInit() {
        console.log("init goes on");
    }
}
