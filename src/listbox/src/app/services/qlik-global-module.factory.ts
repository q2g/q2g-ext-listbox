import { InjectionToken } from "@angular/core";
import { } from "enigma.js";

/**
 * expand window interface for own
 * classes
 */
declare global {
  interface Window {
    engineModuleGlobal: {
      currentApp: EngineAPI.IApp;
    };
  }
}

/** create global context of qlik currentApp */
export function qlikGlobalModuleCurrentAppFactory() {
  return window.engineModuleGlobal.currentApp;
}

/** create injection token which provides qlik global current app */
export const App = new InjectionToken("Qlik Global Module", {
    providedIn: 'root',
    factory: qlikGlobalModuleCurrentAppFactory
});
