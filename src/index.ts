import * as fs from "fs";
import {
    Model,
    JSONModel,
} from './model';
import { Generator } from './generator';
import { CLOSE_BRACKET, START_MUTATION} from './constants';
import { inspect } from 'util';

interface Args {
    path: string;
    records: number;
    outpath?: string;
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
    /**
     * 
     * @param model 
     * Writes seed file, establishes a generator and loops over each type
     */
    writeSeedFile(model: JSONModel) {
        const generator = new Generator(model);
        // Begin write stream
        const stream = fs.createWriteStream(this.outpath, { flags: 'w' });
        stream.write(START_MUTATION);
        // Write types
        for (let i = 0; i < model.types.length; i++) {
            const type = model.types[i];
            if (!generator.createdRecords[type.name] || generator.createdRecords[type.name] < this.records) {
                generator.updateRecord(type.name);
                while (generator.createdRecords[type.name] <= this.records) {
                    const recordName = `${type.name}${generator.createdRecords[type.name]}:`;
                    const createString = `create${type.name} (\ndata:\n`;
                    const closeString = `\n) { id }\n`;
                    stream.write(recordName);
                    stream.write(createString);
                    stream.write(`${inspect(generator.generateType(type), { depth: Infinity }).replace(/'/g, `"`)}${closeString}`);
                }
            }
        }
        // Finish writing to and close write stream
        this.endMutation(stream);
    }

    /**
     * 
     * @param stream 
     * Write  ending close bracket,
     * close stream and throw error if any
     */
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
