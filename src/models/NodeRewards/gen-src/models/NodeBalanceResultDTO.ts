/* tslint:disable */
/* eslint-disable */
/**
 * Symbol Node Rewards API
 * The API is the rest gateway to the symbol rewards controller.
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface NodeBalanceResultDTO
 */
export interface NodeBalanceResultDTO {
    /**
     * ID of the test result
     * @type {string}
     * @memberof NodeBalanceResultDTO
     */
    id: string;
    /**
     * ID of the tested node
     * @type {string}
     * @memberof NodeBalanceResultDTO
     */
    nodeId: string;
    /**
     * 
     * @type {number}
     * @memberof NodeBalanceResultDTO
     */
    expectedMinBalance: number;
    /**
     * 
     * @type {number}
     * @memberof NodeBalanceResultDTO
     */
    reportedBalance: number;
    /**
     * 
     * @type {number}
     * @memberof NodeBalanceResultDTO
     */
    round: number;
    /**
     * 
     * @type {boolean}
     * @memberof NodeBalanceResultDTO
     */
    resultValid: boolean;
    /**
     * 
     * @type {Date}
     * @memberof NodeBalanceResultDTO
     */
    createdAt: Date;
}

export function NodeBalanceResultDTOFromJSON(json: any): NodeBalanceResultDTO {
    return NodeBalanceResultDTOFromJSONTyped(json, false);
}

export function NodeBalanceResultDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): NodeBalanceResultDTO {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'nodeId': json['nodeId'],
        'expectedMinBalance': json['expectedMinBalance'],
        'reportedBalance': json['reportedBalance'],
        'round': json['round'],
        'resultValid': json['resultValid'],
        'createdAt': (new Date(json['createdAt'])),
    };
}

export function NodeBalanceResultDTOToJSON(value?: NodeBalanceResultDTO | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'nodeId': value.nodeId,
        'expectedMinBalance': value.expectedMinBalance,
        'reportedBalance': value.reportedBalance,
        'round': value.round,
        'resultValid': value.resultValid,
        'createdAt': (value.createdAt.toISOString()),
    };
}


