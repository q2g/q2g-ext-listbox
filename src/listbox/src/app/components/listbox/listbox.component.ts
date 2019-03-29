import { Component, OnInit, Input } from '@angular/core';
import { ExtensionComponent } from '../../api/extension.component.interface';

@Component({
    selector: 'q2g-listbox',
    templateUrl: 'listbox.component.html'
})
export class ListboxComponent implements OnInit, ExtensionComponent {

    private _model: EngineAPI.IGenericObject;

    @Input()
    public set model(model: EngineAPI.IGenericObject) {
        this._model = model;
        this._model.on("changed", () => this.modelChange());
        this._model.emit("changed");
    }

    async ngOnInit() {
    }

    private async modelChange() {
        let layout = await this._model.getLayout();
    }
}
