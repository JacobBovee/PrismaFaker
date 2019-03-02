import * as fs from "fs";
import { parse } from "graphql";

interface ConstructorArgs {
    path: string;
}

interface JSONDirective {
    name: string;
    kind: string;
}

interface JSONRelation {
    name?: string;
    relatesTo?: string;
}

interface JSONField {
    name: string;
    type: string;
    unique: boolean;
    relation: JSONRelation;
    directives: [JSONDirective];
}

interface JSONType {
    name: string;
    fields: [JSONField?];
}

interface JSONEnum {
    name: string;
    enums: [string];
}

interface JSONModel {
    enums: [JSONEnum?];
    types: [JSONType?];
}

export class PrismaFaker {
    jsonModel: JSONModel;

    constructor({ path }: ConstructorArgs) {
        // Initialize json model
        this.jsonModel = {
            enums: [],
            types: [],
        };
        this.fetchFile(path);
        //this.modelToJson(parsedModel);
        console.log(this.jsonModel);
    }

    fetchFile(path: string) {
        fs.readFile(path, (err, data) => {
            if (err) {
                throw err;
            }
            const content: string = data.toString("utf-8");
            const parsed = parse(content) as any;
            this.modelToJson(parsed);
        });
    }

    parseFields(field: any) {
        const fieldInfo: any = {
            name: field.name.value,
            unique: false,
            directives: [],
        };
        const setType = (type: any) => {
            if (type.name && type.kind === 'NamedType') {
                fieldInfo.type = type.name.value;
                return;
            }
            else if (type.type) {
                setType(type.type);
            }
            return;
        };
        setType(field.type);

        field.directives.forEach((directive: any) => {
            if (directive) {    
                if (directive.name.value === 'unique') {
                    fieldInfo.unique = true;
                }
                if (directive.name.value === 'relation') {
                    fieldInfo.relation = {
                        relatesTo: fieldInfo.type,
                    };
                    if (directive.arguments) {
                        fieldInfo.relation.name = directive.arguments[0]
                            .value.value;
                    }
                }
            }
            return null;
        });

        return fieldInfo;
    }

    modelToJson(parsedModel: any) {
        parsedModel.definitions.forEach((definition: any) => {
            if (definition.kind === "ObjectTypeDefinition") {
                const fields = definition.fields.map((field: any) =>
                    this.parseFields(field)
                );
                const jsonType: JSONType = {
                    name: definition.name.value,
                    fields,
                };
                this.jsonModel.types.push(jsonType);
            }
            else if (definition.kind === "EnumTypeDefinition") {
                const jsonEnum: JSONEnum = {
                    name: definition.name.value,
                    enums: definition.values.map((enumValue: any) => {
                        return enumValue.value;
                    }),
                };
                this.jsonModel.enums.push(jsonEnum);
            }
        });
    }
}
