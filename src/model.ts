import {
    parse,
    ArgumentNode,
    DirectiveNode,
    DocumentNode,
    DefinitionNode,
    EnumValueDefinitionNode,
    FieldDefinitionNode,
    TypeNode,
    StringValueNode,
} from 'graphql';
import { type } from 'os';

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
// tslint:disable-next-line:no-default-export
export class Model {
    enums: JSONEnum[] = [];
    types: JSONType[] = [];

    /**
     * @param datamodel The data model as a string
     */
    constructor(datamodel: string) {
        const parsedDataModel = parse(datamodel);
        this.modelToJson(parsedDataModel);
    }

    /** 
     * Iterates over Graphql type to extract type names
     * @param type Graphql type node
     * @param typeArray initialized array to push type name
     * @returns {}
     */
    getTypes(type: TypeNode, typeArray: [string?]) {
        if (type.kind === 'NamedType') {
            typeArray.push(type.name.value);
            return typeArray;
        }
        else {
            typeArray.push(type.kind);
            this.getTypes(type.type, typeArray);
            return typeArray;
        }
    }

    /**
     * @param field Field object of parsed datamodel
     */
    parseFields(field: FieldDefinitionNode) {
        const types: [string?] = this.getTypes(field.type, []);
        const parsedField: JSONField = {
            name: field.name.value,
            types,
        };

        if (field.directives) {
            parsedField.directives = field.directives
                .map((directive: DirectiveNode) => {
                    const customDirective: JSONDirective = {};
                    if (directive.name.value) {
                        customDirective.kind = directive.name.value;
                    }
                    if (directive.arguments && directive.arguments.length) {
                        customDirective.arguments = directive.arguments;
                    }
                    return customDirective;
                });
        }
        
        return parsedField;
    }

    /**
     * Sets json model
     * @param datamodel Graphql parsed datamodel
     * @returns {}
     */
    modelToJson(datamodel: DocumentNode) {
        datamodel.definitions.forEach((definition: DefinitionNode) => {
            if (definition.kind === "ObjectTypeDefinition" && definition.fields) {
                const fields = definition.fields.map((field: FieldDefinitionNode) =>
                    this.parseFields(field)
                );
                const customType: JSONType = {
                    name: definition.name.value,
                    fields,
                };
                this.types.push(customType);
            }
            else if (definition.kind === "EnumTypeDefinition" && definition.values) {
                const customEnum: JSONEnum = {
                    name: definition.name.value,
                    enums: definition.values
                        .map((enumValue: EnumValueDefinitionNode) => {
                            return enumValue.name.value;
                        }),
                };
                this.enums.push(customEnum);
            }
        });
    }

    /**
     * 
     * @param typeName 
     * @return {JSONType | undefined} 
     */
    findType(typeName: string) {
        return this.types.find((type: JSONType) => type.name === typeName);
    }

    /**
     * 
     * @param enumName 
     * @return {JSONEnum | undefined} 
     */
    findEnum(enumName: string) {
        return this.enums.find((jsonEnum: JSONEnum) => jsonEnum.name === enumName);
    }
}

export const utils = {
    /**
     * 
     * @param field 
     * @returns {string | null}
     */
    defaultValue: (field: JSONField) => {
        const directive = utils.getDirective(field.directives, 'default');
        if (directive) {
            return utils.getArgumentValue(directive.arguments);
        }
        return null;
    },

    /**
     * 
     * @param field 
     * @returns {string | null}
     */
    relationType: (field: JSONField) => {
        const directive = utils.getDirective(field.directives, 'relation');
        if (directive) {
            return utils.getArgumentValue(directive.arguments);
        }
        return null;
    },

    /**
     * @param field 
     * @return {boolean}
     */
    isUnique: (field: JSONField) => {
        return utils.getDirective(field.directives, 'unique') === null ? false : true;
    },

    /**
     * 
     * @param field 
     * @returns {string}
     */
    namedType: (field: JSONField) => {
        return field.types[field.types.length-1];
    },

    /**
     * 
     * @param field 
     * @returns {number}
     */
    isRequired: (field: JSONField) => {
        return field.types.indexOf('NonNullType');
    },

    /**
     * 
     * @param field 
     * @returns {number}
     */
    isList: (field: JSONField) => {
        return field.types.indexOf('ListType');
    },
    /**
     * 
     * @param directives 
     * @param kind 
     * @returns {DirectiveNode | null}
     */
    getDirective: (directives: JSONDirective[] | undefined, kind: string) => {
        if (directives) {
            for (let i = 0; i < directives.length; i++) {
                const directive = directives[i];
                if (directive.kind === kind) {
                    return directive;
                }
            }
        }
        return null;
    },
        
    /**
     * 
     * @param directiveArguments 
     * @returns {string | null}
     */
    getArgumentValue: (directiveArguments?: ReadonlyArray<ArgumentNode>) => {
        if (directiveArguments) {
            for (let i = 0; i < directiveArguments.length; i++) {
                if (directiveArguments[i].name.value.toLowerCase() === 'value') {
                    const argument: StringValueNode = directiveArguments[i].value as StringValueNode;
                    return argument.value;
                }
            }
        }
        return null;
    },

};