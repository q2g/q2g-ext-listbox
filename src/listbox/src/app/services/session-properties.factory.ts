import { PropertiesModel } from '../model/properties.model';
import { Sort } from 'extension/api/porperties.interface';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: "root" })
export class SessionPropertiesFactory {

    /** create session params for generic list */
    public createGenericList(properties: PropertiesModel): EngineAPI.IGenericListProperties {

        var subObjFieldDefs = "";

        if (properties.dimension.length > 1) {
            for (const dimension of properties.dimension) {
                subObjFieldDefs = subObjFieldDefs + "& '\uFEFF' &[" + dimension.qDef.qFieldDefs[0].replace("=", "") + "]";
            }
            for (const dimension of properties.dimension) {
                subObjFieldDefs = subObjFieldDefs + ', [' + dimension.qDef.qFieldDefs[0].replace("=", "") + "]";
            }
            subObjFieldDefs = subObjFieldDefs.substr(7);
            subObjFieldDefs = "=aggr(" + subObjFieldDefs + ")";
        } else {
            subObjFieldDefs = properties.dimension[0].qDef.qFieldDefs[0]
        }

        const listParam: EngineAPI.IGenericListProperties = {
            qInfo: { qType: "ListObject" },
            qListObjectDef: {
                qStateName: "$",
                qAutoSortByState: {
                    qDisplayNumberOfRows: -1
                },
                qLibraryId: (properties.dimension[0].qDef as any).qLibraryId,
                qDef: {
                    qFieldDefs: [subObjFieldDefs],
                    qSortCriterias: [
                        this.createSortCriterias(properties.sorting)
                    ] as any
                },
                qFrequencyMode: "NX_FREQUENCY_NONE",
                qInitialDataFetch: [
                    {
                        qHeight: 0,
                        qLeft: 0,
                        qTop: 0,
                        qWidth: 0
                    }
                ],
                qShowAlternatives: true
            }
        };
        return listParam;
    }

    /** create session params for generic list */
    public createTreeProperties(properties: PropertiesModel): EngineAPI.IGenericListProperties {

        const dimensionList: { name: string, value: string, measure: string }[] = [];

        for (const dimension of properties.dimension) {
            dimensionList.push({
                name: dimension.qDef.qFieldLabels[0],
                value: dimension.qDef.qFieldDefs[0],
                measure: dimension.qAttributeExpressions[0].qExpression
            });
        }

        const info: EngineAPI.INxInfo = {
            qType: "TreeCube",
            qId: ""
        };

        let measure = "only({1} if(";
        let measurePart1 = "";
        let measurePart2 = "";

        for (const dimension of dimensionList) {
            measurePart1 += "not isnull([" + dimension.value + "]) or ";
            measurePart2 += "[" + dimension.value + "]" + "&";
        }

        measure += measurePart1.slice(0, -3) + ",'O' , 'N' ))&only(if(not isnull(" + measurePart2.slice(0, -1);
        measure += "),'N', 'O'))";


        const dimensions: EngineAPI.INxDimension[] = [];
        for (const dimension of dimensionList) {
            const newDimension: any = {
                qDef: {
                    qFieldDefs: [
                        dimension.value
                    ],
                    qFieldLabels: [
                        dimension.name
                    ]
                },
                qAttributeExpressions: [
                    {
                        qExpression: dimension.measure
                    },
                    {
                        qExpression: measure
                    }
                ]
            };
            dimensions.push(newDimension);
        }

        const listParam: any = {
            qExtendsId: "",
            qMetaDef: {},
            qStateName: "$",
            qInfo: info,
            qTreeDataDef: {
                qAlwaysFullyExpanded: false,
                qMode: "DATA_MODE_TREE",
                qStateName: "$",
                qDimensions: dimensions,
            }
        };

        return listParam;
    }

    /** create sort direction definitions */
    private createSortCriterias(criterias: Sort.Criterias): EngineAPI.ISortCriteria {
        const p: EngineAPI.ISortCriteria = {
            qSortByAscii: this.getSortDirection(criterias.ascii) as any,
            qSortByExpression: this.getSortDirection(
                criterias.expression
            ) as any,
            qSortByFrequency: this.getSortDirection(criterias.frequency) as any,
            qSortByLoadOrder: this.getSortDirection(criterias.loadOrder) as any,
            qSortByNumeric: this.getSortDirection(criterias.numeric) as any,
            qSortByState: this.getSortDirection(criterias.state) as any
        };
        p.qExpression = criterias.expression.value;
        return p;
    }

    /** get current sort direction for field */
    private getSortDirection(field: Sort.Field<EngineAPI.TypeSortDirection | EngineAPI.IValueExpr>): number {
        if (!field.enabled) {
            return 0;
        }
        return field.orderBy === "a" ? 1 : -1;
    }
}
