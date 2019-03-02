"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var model_1 = require("./model");
var PrismaFaker = /** @class */ (function () {
    function PrismaFaker(_a) {
        var path = _a.path;
        this.fetchFile(path);
    }
    PrismaFaker.prototype.fetchFile = function (path) {
        fs.readFile(path, function (err, data) {
            if (err) {
                throw err;
            }
            var content = data.toString("utf-8");
            var parsedModel = model_1.parseModel(content);
        });
    };
    PrismaFaker.prototype.createSeedFile = function (parsedModel) {
        return;
    };
    PrismaFaker.prototype.writeToFile = function () {
        return;
    };
    return PrismaFaker;
}());
var faked = new PrismaFaker({ path: "/Users/jacobbovee/Feather/be-feather/prisma/datamodel.prisma" });
//# sourceMappingURL=index.js.map