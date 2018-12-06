import { dimensions } from "./definition/dimensions.definition";
import { sorting } from "./definition/sorting.definition";
import { settings } from "./definition/settings.definition";

export const definition = {
    type: "items",
    component: "accordion",
    items: {
        dimensions: dimensions,
        sorting: sorting,
        settings: settings
    }
};