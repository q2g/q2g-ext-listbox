import { Observable, forkJoin, of } from "rxjs";

/**
 * if multiple sessions should be created before
 * one is completed, take allways the last create session
 * request and close all others before
 */
export function debounceQlikSession() {
    let current: string;
    return Observable.create(subscriber => {
        const source: Observable<EngineAPI.IApp> = this;
        const subscription = source.subscribe(

            // app has been loaded
            (app: EngineAPI.IApp): any => {

                /** create session create stream */
                const sessionStream = app.createSessionObject({
                    qInfo: {
                        qType: 'q2gSessionObject'
                    }
                });

                const id = Math.random().toString(32).substr(2);

                /** create session stream combined with id | session create stream */
                const stream = forkJoin([id, sessionStream]); 

                current = id;

                // put id on top of stack
                stream.subscribe(([id, obj]) => {
                    current !== id 
                        ? subscriber.next(obj)
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
