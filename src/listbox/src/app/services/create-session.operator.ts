import { Observable, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

/**
 * if multiple sessions should be created before
 * one is completed, take allways the last create session
 * request and close all others before
 */
export function debounceQlikSession<
    P extends EngineAPI.IGenericProperties,
    O extends EngineAPI.IGenericObject
>(params: P) {
    let current: string;
    return source$ =>
        new Observable<O>(subscriber => {
            const source: Observable<EngineAPI.IApp> = source$;
            const subscription = source.subscribe(
                // app has been loaded
                (app: EngineAPI.IApp): any => {
                    /** create session create stream */
                    const sessionObj = app.createSessionObject(params);
                    /** create id so we could find it again */
                    const id = Math.random()
                        .toString(32)
                        .substr(2);
                    /** create session stream combined with id | session create stream */
                    current = id;

                    forkJoin([id, sessionObj])
                        .subscribe(([id, obj]) => {
                            const session = obj as O;
                            current !== id
                                ? subscriber.next(session)
                                : app.destroySessionObject(obj.id);
                        });
                },
                err => subscriber.error(err),
                () => subscriber.complete()
            );
            // to return now
            return subscription;
        });
}
