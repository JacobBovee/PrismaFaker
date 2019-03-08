"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var model_1 = require("./model");
var generator_1 = require("./generator");
var constants_1 = require("./constants");
var util_1 = require("util");
var PrismaFaker = /** @class */ (function () {
    function PrismaFaker(_a) {
        var path = _a.path, records = _a.records, _b = _a.outpath, outpath = _b === void 0 ? 'seed.graphql' : _b;
        this.records = records;
        this.outpath = outpath;
        this.fetchFile(path);
    }
    PrismaFaker.prototype.fetchFile = function (path) {
        var _this = this;
        fs.readFile(path, function (err, data) {
            if (err) {
                throw err;
            }
            var jsonModel = new model_1.Model(data.toString("utf-8"));
            _this.writeSeedFile(jsonModel);
        });
    };
    /**
     *
     * @param model
     * Writes seed file, establishes a generator and loops over each type
     */
    PrismaFaker.prototype.writeSeedFile = function (model) {
        var generator = new generator_1.Generator(model);
        // Begin write stream
        var stream = fs.createWriteStream(this.outpath, { flags: 'w' });
        stream.write(constants_1.START_MUTATION);
        // Write types
        for (var i = 0; i < model.types.length; i++) {
            var type = model.types[i];
            if (!generator.createdRecords[type.name] || generator.createdRecords[type.name] < 1000) {
                generator.createdRecords[type.name] = 1;
                while (generator.createdRecords[type.name] <= this.records) {
                    var recordName = "" + type.name + generator.createdRecords[type.name] + ":";
                    var createString = "create" + type.name + " (\ndata:\n";
                    var closeString = "\n) { id }\n";
                    stream.write(recordName);
                    stream.write(createString);
                    stream.write("" + util_1.inspect(generator.generateType(type), { depth: Infinity }) + closeString);
                }
            }
        }
        // Finish writing to and close write stream
        this.endMutation(stream);
    };
    /**
     *
     * @param stream
     * Write  ending close bracket,
     * close stream and throw error if any
     */
    PrismaFaker.prototype.endMutation = function (stream) {
        stream.write(constants_1.CLOSE_BRACKET);
        stream.close();
        stream.end(function (err) {
            if (err) {
                console.error(err);
                throw err;
            }
        });
    };
    return PrismaFaker;
}());
exports.PrismaFaker = PrismaFaker;
//# sourceMappingURL=index.js.map