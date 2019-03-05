import {
    parse,
    ArgumentNode,
    DirectiveNode,
    DocumentNode,
    DefinitionNode,
    EnumValueDefinitionNode,
    FieldDefinitionNode,
    TypeNode,
} from 'graphql';

interface JSONDirective {
    arguments?: ReadonlyArray<ArgumentNode>;
    kind?: string;
}

interface JSONField {
    name: string;
    types: [string?];
    directives?: JSONDirective[];
}

interface JSONType {
    name: string;
    fields: JSONField[];
}

interface JSONEnum {
    name: string;
    enums: string[];
}

interface JSONModel {
    enums: [JSONEnum?];
    types: [JSONType?];
}

/**
 * Parses a datamodel given as a graphql parsed datamodel
 * to a json model to work with.
 */
// tslint:disable-next-line:no-default-export
export default class Parser {
    enums: [JSONEnum?] = [];
    types: [JSONType?] = [];

    /**
     * @param datamodel The data model as a string
     */
    constructor(datamodel: string) {
        const parsedDataModel = parse(datamodel);
        this.modelToJson(parsedDataModel);
    }

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
        const trimmedField: JSONField = {
            name: field.name.value,
            types,
        };

        if (field.directives) {
            trimmedField.directives = field.directives
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
        
        return trimmedField;
    }

    /**
     * @param datamodel Graphql parsed datamodel
     * Sets json model
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

    getDirective(directives: JSONDirective[] | undefined, kind: string) {
        if (directives) {
            for (let i = 0; i < directives.length; i++) {
                const directive = directives[i];
                if (directive.kind === kind) {
                    return directive;
                }
            }
        }
        return null;
    }

    isUnique(field: JSONField) {
        return this.getDirective(field.directives, 'unique') === null ? false : true;
    }

    defaultValue(field: JSONField) {
        const directive = this.getDirective(field.directives, 'default');
        if (directive) {
            console.log(directive.arguments);
        }

        return false;
    }

    namedType(field: JSONField) {
        return field.types[-1];
    }

    isRequired(field: JSONField) {
        return field.types.indexOf('NonNullType');
    }

    isList(field: JSONField) {
        return field.types.indexOf('ListType');
    }
}
