/**
 * SlidFinance
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface Transaction { 
    id?: number;
    accountId?: number;
    dateTime?: Date;
    amount?: number;
    categoryId?: number;
    description?: string;
    mcc?: number;
    bankCategory?: string;
    approved?: boolean;
}
