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
    | boolean
    | Date;

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
        // Move this error logic to model class
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
                    const generatedType = this.generateType(isType, inType.concat(fieldType));

                    return { create: generatedType };
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
                return Math.floor(this.generateNumber(SCALAR_NUMBER_MAX, SCALAR_NUMBER_MIN));
            case 'Float':
                return this.generateNumber(SCALAR_NUMBER_MAX, SCALAR_NUMBER_MIN);
            case 'DateTime':
                return this.generateDateTime();
            case 'Boolean':
                return this.generateBoolean();
            case 'JSON':
                return this.generateJSON();
            default:
                console.log(fieldType);
                throw new Error('Some fields did not contain a valid type');
        }
    }

    /**
     * 
     * @param max max range of random number
     * @param min min range of random number
     * @returns { number }
     */
    generateNumber(max: number, min: number): number {
        return Math.random() * ((max - min) + min);
    }

    /**
     * @returns { string }
     */
    generateString(): string {
        let randomString = '';
        for (let i = 0; i < this.generateNumber(0, 20); i++) {
            randomString += String.fromCharCode(this.generateNumber(65, 91));
        }

        return randomString;
    }

    /**
     * @returns { boolean }
     */
    generateBoolean(): boolean {
        return Math.floor(Math.random() * 2) === 0 ? false : true;
    }

    /**
     * @return { Date }
     */
    generateDateTime(): Date {
        return new Date();
    }

    /**
     * @returns { string }
     */
    generateJSON(): string {
        return `{ ${this.generateString()}: ${this.generateString()} }`;
    }
}