"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parsedToJson(types) {
    return;
}
function parseTypes(rawModel) {
    var typeRegex = /(type|enum)\s(\w*)[\s|\{}]/i;
    return rawModel
        .split('\n')
        .map(function (modelLine) {
        var matched = modelLine.match(typeRegex);
        if (matched) {
            return {
                typeKey: matched[1].toLowerCase(),
                typeValue: matched[2],
                input: matched['input'],
            };
        }
        return false;
    })
        .filter(function (returned) { return returned; });
}
function parseGroups(rawModel) {
    var types = parseTypes(rawModel);
    var contents = [];
    rawModel
        .split("}")
        .forEach(function (block) {
        types.forEach(function (type) {
            var exists = block.indexOf(type.input);
            if (exists !== -1) {
                contents.push({
                    fields: block
                        .replace(type.input, "")
                        .replace(/[\r\n]+/g, '\n'),
                    type: {
                        key: type.typeKey,
                        value: type.typeValue,
                    },
                });
                return;
            }
        });
    });
    return contents;
}
function parseModel(rawModel) {
    // Strip comments and new lines
    rawModel = rawModel.replace(/#.*/g, "");
    // Bracket contents
    var groups = parseGroups(rawModel);
    console.log("groups =>", groups);
}
exports.parseModel = parseModel;
//# sourceMappingURL=model.js.map