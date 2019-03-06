import * as fs from 'fs';
import {
    JSONType,
    JSONField,
    JSONModel,
    utils,
} from './model';
import { CreatedRecords } from './index';
import { inspect } from 'util';
import { NATIVE_FIELDS } from './constants';

interface GeneratedType {
    [fieldName: string]: any;
}

export function generateType(model: JSONModel, type: JSONType, createdRecords: CreatedRecords) {
    const generatedType: GeneratedType = {};
    for (let i = 0; i < type.fields.length; i++) {
        const field: JSONField = type.fields[i];
        const generated = generateField(model, field, createdRecords);
        if (generated) {
            generatedType[field.name] = generated;
        }
    }
    createdRecords[type.name]++;

    return inspect(generatedType, { depth: Infinity });
}

function generateField(model: JSONModel, field: JSONField, createdRecords: CreatedRecords) {
    const typeName = utils.namedType(field);
    if (!typeName || NATIVE_FIELDS.indexOf(field.name) || utils.namedType(field) === 'ID') {
        return false;
    }
    if (model.findEnum(typeName)) {
        return 'x';
    }
    return 'x';
}
