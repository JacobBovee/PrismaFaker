import { ArgumentNode, DocumentNode, FieldDefinitionNode, TypeNode } from 'graphql';
interface JSONDirective {
    arguments?: ReadonlyArray<ArgumentNode>;
    kind?: string;
}
export interface JSONField {
    name: string;
    types: [string?];
    directives?: JSONDirective[];
}
export interface JSONType {
    name: string;
    fields: JSONField[];
}
export interface JSONEnum {
    name: string;
    enums: string[];
}
export interface JSONModel {
    enums: JSONEnum[];
    types: JSONType[];
    findEnum: (enumName: string) => JSONEnum | undefined;
    findType: (typeName: string) => JSONType | undefined;
}
/**
 * Parses a datamodel given as a graphql parsed datamodel
 * to a json model to work with.
 */
export declare class Model {
    enums: JSONEnum[];
    types: JSONType[];
    /**
     * @param datamodel The data model as a string
     */
    constructor(datamodel: string);
    /**
     * Iterates over Graphql type to extract type names
     * @param type Graphql type node
     * @param typeArray initialized array to push type name
     * @returns {}
     */
    getTypes(type: TypeNode, typeArray: [string?]): [(string | undefined)?];
    /**
     * @param field Field object of parsed datamodel
     */
    parseFields(field: FieldDefinitionNode): JSONField;
    /**
     * Sets json model
     * @param datamodel Graphql parsed datamodel
     * @returns {}
     */
    modelToJson(datamodel: DocumentNode): void;
    /**
     *
     * @param typeName
     * @return {JSONType | undefined}
     */
    findType(typeName: string): JSONType | undefined;
    /**
     *
     * @param enumName
     * @return {JSONEnum | undefined}
     */
    findEnum(enumName: string): JSONEnum | undefined;
}
export declare const utils: {
    /**
     *
     * @param field
     * @returns {string | null}
     */
    defaultValue: (field: JSONField) => string | null;
    /**
     *
     * @param field
     * @returns {string | null}
     */
    relationType: (field: JSONField) => string | null;
    /**
     * @param field
     * @return {boolean}
     */
    isUnique: (field: JSONField) => boolean;
    /**
     *
     * @param field
     * @returns {string}
     */
    namedType: (field: JSONField) => string | undefined;
    /**
     *
     * @param field
     * @returns {number}
     */
    isRequired: (field: JSONField) => boolean;
    /**
     *
     * @param field
     * @returns {number}
     */
    isList: (field: JSONField) => number;
    /**
     *
     * @param directives
     * @param kind
     * @returns {DirectiveNode | null}
     */
    getDirective: (directives: JSONDirective[] | undefined, kind: string) => JSONDirective | null;
    /**
     *
     * @param directiveArguments
     * @returns {string | null}
     */
    getArgumentValue: (directiveArguments?: ReadonlyArray<ArgumentNode> | undefined) => string | null;
};
export {};
