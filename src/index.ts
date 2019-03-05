import * as fs from "fs";
import Parser from './parser';

interface Args {
    path: string;
}

export class PrismaFaker {
    constructor({ path }: Args) {
        this.fetchFile(path);
    }

    fetchFile(path: string) {
        fs.readFile(path, (err, data) => {
            if (err) {
                throw err;
            }
            const jsonModel: any = new Parser(data.toString("utf-8"));
            this.writeSeedFile(jsonModel);
        });
    }

    createMutation() {
        // Create mutations for each type definition here
    }

    writeSeedFile(model: any) {
        // Iterate over types here
        console.log('model =>', model);
    }
}
