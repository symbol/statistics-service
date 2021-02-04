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
 * @interface ChainPartResultDTO
 */
export interface ChainPartResultDTO {
    /**
     * ID of the test result
     * @type {string}
     * @memberof ChainPartResultDTO
     */
    id: string;
    /**
     * ID of the tested node
     * @type {string}
     * @memberof ChainPartResultDTO
     */
    nodeId: string;
    /**
     * 
     * @type {number}
     * @memberof ChainPartResultDTO
     */
    fromHeight: number;
    /**
     * 
     * @type {number}
     * @memberof ChainPartResultDTO
     */
    numBlocks: number;
    /**
     * 
     * @type {string}
     * @memberof ChainPartResultDTO
     */
    expectedHash: string;
    /**
     * 
     * @type {string}
     * @memberof ChainPartResultDTO
     */
    reportedHash: string;
    /**
     * 
     * @type {number}
     * @memberof ChainPartResultDTO
     */
    round: number;
    /**
     * 
     * @type {boolean}
     * @memberof ChainPartResultDTO
     */
    resultValid: boolean;
    /**
     * 
     * @type {Date}
     * @memberof ChainPartResultDTO
     */
    createdAt: Date;
}

export function ChainPartResultDTOFromJSON(json: any): ChainPartResultDTO {
    return ChainPartResultDTOFromJSONTyped(json, false);
}

export function ChainPartResultDTOFromJSONTyped(json: any, ignoreDiscriminator: boolean): ChainPartResultDTO {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'nodeId': json['nodeId'],
        'fromHeight': json['fromHeight'],
        'numBlocks': json['numBlocks'],
        'expectedHash': json['expectedHash'],
        'reportedHash': json['reportedHash'],
        'round': json['round'],
        'resultValid': json['resultValid'],
        'createdAt': (new Date(json['createdAt'])),
    };
}

export function ChainPartResultDTOToJSON(value?: ChainPartResultDTO | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'nodeId': value.nodeId,
        'fromHeight': value.fromHeight,
        'numBlocks': value.numBlocks,
        'expectedHash': value.expectedHash,
        'reportedHash': value.reportedHash,
        'round': value.round,
        'resultValid': value.resultValid,
        'createdAt': (value.createdAt.toISOString()),
    };
}


