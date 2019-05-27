import { NgModule, Injector, DoBootstrap } from "@angular/core";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { createCustomElement } from "@angular/elements";
import { BrowserModule } from "@angular/platform-browser";
import { NgxCustomScrollbarModule } from "ngx-customscrollbar";

import { ListboxComponent } from "./components/listbox/listbox.component";
import { SearchModule, ListViewModule } from "davinci.js";
import { IconModule, ResponsiveMenuModule } from "davinci.js";

export const EXTENSION_ID = "q2g-ext-listbox";

@NgModule( {
    imports: [
        BrowserModule,
        ScrollingModule,
        NgxCustomScrollbarModule,
        ListViewModule,
        SearchModule,
        IconModule,
        ResponsiveMenuModule
    ],
    exports: [],
    declarations: [ListboxComponent],
    entryComponents: [ListboxComponent]
} )
export class ListboxModule implements DoBootstrap {

    public constructor(private injector: Injector) { }

    ngDoBootstrap() {
        const q2gBoostrap = createCustomElement(ListboxComponent, {
            injector: this.injector
        });
        customElements.define( EXTENSION_ID, q2gBoostrap );
    }
}
