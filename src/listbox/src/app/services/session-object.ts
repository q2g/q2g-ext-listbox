import { genericObjectProperties } from "../api/object-properties";

export class SessionObject {
    private sessionObject: EngineAPI.IGenericObject;

    /**
     * 
     * @param session
     */
    private constructor(session: EngineAPI.IGenericObject) {
        this.sessionObject = session;
        this.registerEvents();
    }

    /**
     * create new session object
     * @param {EngineAPI.IApp} app 
     */
    public static async create(app: EngineAPI.IApp): Promise<SessionObject> {
        const session = await app.createSessionObject({
            qInfo: {
                qType: 'Q2gListboxListObject'
            }
        });
        return new SessionObject(session);
    }

    /**
     * apply all updates on session object
     *
     * @returns {Promise<EngineAPI.IGenericHyperCubeLayout>}
     * @memberof SessionObject
     */
    public async applyUpdate(): Promise<EngineAPI.IGenericHyperCubeLayout> {
        return this.sessionObject.getLayout() as Promise<
            EngineAPI.IGenericHyperCubeLayout
        >;
    }

    /**
     * update dimensions on session object
     *
     * @param {string[]} dimensionList
     * @returns {Promise<void>}
     * @memberof SessionObject
     */
    public async updateDimensions(dimensionList: string[]): Promise<void> {
        const qSubObjectFieldDef = dimensionList.map<
            EngineAPI.IHyperCubeDimensionDef
        >((dimensionDefinition: string) => {
            return {
                qDef: {
                    qFieldDefs: [dimensionDefinition]
                }
            };
        });

        return this.sessionObject.applyPatches([
            {
                qPath: "qHyperCubeDef/qDimensions",
                qOp: "Replace",
                qValue: JSON.stringify(qSubObjectFieldDef)
            }
        ]);
    }

    /**
     *
     */
    public async getDataPages(
        top: number = 0,
        height: number = 10
    ): Promise<EngineAPI.INxDataPage[]> {
        return this.sessionObject.getHyperCubeData("/qHyperCubeDef", [
            {
                qHeight: height,
                qLeft: 0,
                qTop: top,
                qWidth: 0
            }
        ]);
    }

    private registerEvents() {
        this.sessionObject.on("changed", () => this.onSessionObjectChanged());
    }

    private async onSessionObjectChanged() {
        await this.sessionObject.getLayout();
    }
}
