import * as fs from 'fs';
import {
    JSONType,
    JSONField,
    JSONModel,
    utils,
} from './model';
import { NATIVE_FIELDS } from './constants';

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

export class Generator {
    model: JSONModel;
    createdRecords: CreatedRecords;
    usedUniqueValues: UsedUniqueValues;

    constructor(model: JSONModel) {
        this.model = model;
        this.createdRecords = {};
        this.usedUniqueValues = {};
    }
    
    generateType(type: JSONType, inType?: string | undefined) {
        const generatedType: GeneratedType = {};
        for (let i = 0; i < type.fields.length; i++) {
            const field: JSONField = type.fields[i];
            const generated = this.generateField(field, type.name, inType);
            if (generated) {
                generatedType[field.name] = generated;
            }
        }
        this.createdRecords[type.name]++;

        return generatedType;
    }
    
    generateField(field: JSONField, typeName: string, inType?: string | undefined) {
        const fieldType = utils.namedType(field);
        if (!fieldType || !NATIVE_FIELDS.indexOf(field.name) || fieldType === 'ID' || fieldType === inType) {
            return false;
        }
        else {
            if (utils.isRequired(field)) {
                const isEnum = this.model.findEnum(fieldType);
                if (isEnum) {
                    const enums = isEnum.enums;
                    return enums[0];
                }
                const isType = this.model.findType(fieldType);
                if (isType) {
                    return { create: this.generateType(isType, typeName) };
                }
                return '';
            }
        }
        return false;
    }

    addUniqueValue(field: string, type: string, value: any) {
        this.usedUniqueValues[field][type].push(value);
    }

    isUsedUniqueValue(field: string, type: string, value: any) {
        return this.usedUniqueValues[field][type].indexOf(value);
    }
    
}