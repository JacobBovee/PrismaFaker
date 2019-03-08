import {
    JSONType,
    JSONField,
    JSONModel,
    utils,
} from './model';
import {
    NATIVE_FIELDS,
    SCALAR_NUMBER_MAX,
    SCALAR_NUMBER_MIN,
} from './constants';
import * as faker from 'faker';

interface CreatedRecords {
    [record: string]: number;
}

interface UsedUniqueValues {
    [type: string]: {
        [field: string]: any[];
    };
}

interface GeneratedType {
    [fieldName: string]: any;
}

type ScalarType = 
    | string
    | number
    | boolean;

export class Generator {
    model: JSONModel;
    createdRecords: CreatedRecords;
    usedUniqueValues: UsedUniqueValues;

    constructor(model: JSONModel) {
        this.model = model;
        this.createdRecords = {};
        this.usedUniqueValues = {};
    }
    
    /**
     * 
     * @param type 
     * @param inType 
     * @returns { object }
     */
    generateType(type: JSONType, inType?: string[]): object {
        const generatedType: GeneratedType = {};
        for (let i = 0; i < type.fields.length; i++) {
            const field: JSONField = type.fields[i];
            const generated = this.generateField(field, inType || [type.name]);

            if (generated) {
                generatedType[field.name] = generated;
            }
        }

        // Increment created type
        this.createdRecords[type.name]++;

        return generatedType;
    }
    
    /**
     * 
     * @param field 
     * @param inType 
     * @returns { object | false | ScalarType }
     */
    generateField(field: JSONField, inType: string[]): object | false | ScalarType {
        const fieldType = utils.namedType(field);
        // 1: Move this error logic to model class
        if (!fieldType) {
            throw new Error(`Your model contains is missing a type on field: ${field.name}`);
        }
        if (NATIVE_FIELDS.indexOf(field.name) > -1 || fieldType === 'ID' || inType.indexOf(fieldType) > -1) {
            return false;
        }
        else {
            const required = utils.isRequired(field);
            const isType = this.model.findType(fieldType);

            if (isType) {
                if (required) {
                    if (inType.length > 1) {
                        return false;
                    }
    
                    this.updateRecord(fieldType);
                    return { create: this.generateType(isType, inType.concat(isType.name)) };
                }

                return false;
            }
            else if (required || this.generateBoolean()) {
                const isEnum = this.model.findEnum(fieldType);
                if (isEnum) {
                    const enums = isEnum.enums;
                    return enums[0];
                }
                else {
                    return this.generateValue(fieldType, field.name);
                }
            }
        }
        return false;
    }

    /**
     * 
     * @param typeName 
     * Increments createdRecords
     */
    updateRecord(typeName: string) {
        if (!this.createdRecords[typeName]) {
            this.createdRecords[typeName] = 1;
        }
        else {
            this.createdRecords[typeName]++;
        }
    }

    /**
     * 
     * @param field 
     * @param type 
     * @param value 
     */
    addUniqueValue(field: string, type: string, value: any) {
        this.usedUniqueValues[field][type].push(value);
    }

    /**
     * 
     * @param field 
     * @param type 
     * @param value 
     * @returns { boolean }
     */
    isUsedUniqueValue(field: string, type: string, value: any): boolean {
        return this.usedUniqueValues[field][type].indexOf(value) > -1 ? true : false;
    }

    /**
     * 
     * @param fieldType 
     * @param fieldName 
     * @returns { ScalarType }
     */
    generateValue(fieldType: string, fieldName: string): ScalarType {
        switch(fieldType) {
            case 'String':
                return this.generateString();
            case 'Int':
                return Math.floor(this.generateNumber());
            case 'Float':
                return this.generateNumber();
            case 'DateTime':
                return this.generateDateTime();
            case 'Boolean':
                return this.generateBoolean();
            case 'JSON':
                return this.generateJSON();
            default:

                throw new Error('Some fields did not contain a valid type');
        }
    }

    /**
     * 

     * @returns { number }
     */
    generateNumber(): number {
        return faker.random.number();
    }

    /**
     * @returns { string }
     */
    generateString(): string {

        return faker.lorem.text();
    }

    /**
     * @returns { boolean }
     */
    generateBoolean(): boolean {
        return Math.floor(Math.random() * 2) === 0 ? false : true;
    }

    /**
     * @return { string }
     */
    generateDateTime(): string {
        return faker.date.recent().toString();
    }

    /**
     * @returns { string }
     */
    generateJSON(): string {
        return `{ ${this.generateString()}: ${this.generateString()} }`;
    }
}