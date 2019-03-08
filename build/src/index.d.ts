/// <reference types="node" />
import * as fs from "fs";
import { JSONModel } from './model';
interface Args {
    path: string;
    records: number;
    outpath?: string;
}
export declare class PrismaFaker {
    records: number;
    outpath: string;
    constructor({ path, records, outpath }: Args);
    fetchFile(path: string): void;
    /**
     *
     * @param model
     * Writes seed file, establishes a generator and loops over each type
     */
    writeSeedFile(model: JSONModel): void;
    /**
     *
     * @param stream
     * Write  ending close bracket,
     * close stream and throw error if any
     */
    endMutation(stream: fs.WriteStream): void;
}
export {};
