import * as fs from "fs";
import {
    Model,
    JSONModel,
} from './model';
import { generateType } from './generate';
import { CLOSE_BRACKET, START_MUTATION} from './constants';

interface Args {
    path: string;
    records: number;
    outpath?: string;
}

export interface CreatedRecords {
    [record: string]: number;
}

export class PrismaFaker {
    records: number;
    outpath: string;
    
    constructor({ path, records, outpath='seed.graphql' }: Args) {
        this.records = records;
        this.outpath = outpath;
        this.fetchFile(path);
    }

    fetchFile(path: string) {
        fs.readFile(path, (err, data) => {
            if (err) {
                throw err;
            }
            const jsonModel: JSONModel = new Model(data.toString("utf-8"));
            this.writeSeedFile(jsonModel);
        });
    }

    writeSeedFile(model: JSONModel) {
        const createdRecords: CreatedRecords = {};
        // Begin write stream
        const stream = fs.createWriteStream(this.outpath, { flags: 'w' });
        stream.write(START_MUTATION);
        // Write types
        for (let i = 0; i < model.types.length; i++) {
            const type = model.types[i];
            if (!createdRecords[type.name] || createdRecords[type.name] < 1000) {
                createdRecords[type.name] = 0;
                while (createdRecords[type.name] < this.records) {
                    const recordName = `${type.name}${createdRecords[type.name]}:`;
                    const createString = `create${type.name} (\ndata:\n`;
                    const closeString = `\n) { id }\n`;
                    stream.write(recordName);
                    stream.write(createString);
                    stream.write(generateType(model, type, createdRecords)+closeString);
                }
            }
        }
        // Finish writing to and close write stream
        this.endMutation(stream);
    }

    endMutation(stream: fs.WriteStream) {
        stream.write(CLOSE_BRACKET);
        stream.close();
        stream.end((err: Error) => {
            if (err) {
                console.error(err);
                throw err;
            }
        });
    }

}

const ps = new PrismaFaker({ path: '/Users/jacobbovee/graphql-prisma-typescript/prisma/datamodel.graphql', records: 10 });