"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
/**
 * Parses a datamodel given as a graphql parsed datamodel
 * to a json model to work with.
 */
// tslint:disable-next-line:no-default-export
var Model = /** @class */ (function () {
    /**
     * @param datamodel The data model as a string
     */
    function Model(datamodel) {
        this.enums = [];
        this.types = [];
        var parsedDataModel = graphql_1.parse(datamodel);
        this.modelToJson(parsedDataModel);
    }
    /**
     * Iterates over Graphql type to extract type names
     * @param type Graphql type node
     * @param typeArray initialized array to push type name
     * @returns {}
     */
    Model.prototype.getTypes = function (type, typeArray) {
        if (type.kind === 'NamedType') {
            typeArray.push(type.name.value);
            return typeArray;
        }
        else {
            typeArray.push(type.kind);
            this.getTypes(type.type, typeArray);
            return typeArray;
        }
    };
    /**
     * @param field Field object of parsed datamodel
     */
    Model.prototype.parseFields = function (field) {
        var types = this.getTypes(field.type, []);
        var parsedField = {
            name: field.name.value,
            types: types,
        };
        if (field.directives) {
            parsedField.directives = field.directives
                .map(function (directive) {
                var customDirective = {};
                if (directive.name.value) {
                    customDirective.kind = directive.name.value;
                }
                if (directive.arguments && directive.arguments.length) {
                    customDirective.arguments = directive.arguments;
                }
                return customDirective;
            });
        }
        return parsedField;
    };
    /**
     * Sets json model
     * @param datamodel Graphql parsed datamodel
     * @returns {}
     */
    Model.prototype.modelToJson = function (datamodel) {
        var _this = this;
        datamodel.definitions.forEach(function (definition) {
            if (definition.kind === "ObjectTypeDefinition" && definition.fields) {
                var fields = definition.fields.map(function (field) {
                    return _this.parseFields(field);
                });
                var customType = {
                    name: definition.name.value,
                    fields: fields,
                };
                _this.types.push(customType);
            }
            else if (definition.kind === "EnumTypeDefinition" && definition.values) {
                var customEnum = {
                    name: definition.name.value,
                    enums: definition.values
                        .map(function (enumValue) {
                        return enumValue.name.value;
                    }),
                };
                _this.enums.push(customEnum);
            }
        });
    };
    /**
     *
     * @param typeName
     * @return {JSONType | undefined}
     */
    Model.prototype.findType = function (typeName) {
        return this.types.find(function (type) { return type.name === typeName; });
    };
    /**
     *
     * @param enumName
     * @return {JSONEnum | undefined}
     */
    Model.prototype.findEnum = function (enumName) {
        return this.enums.find(function (jsonEnum) { return jsonEnum.name === enumName; });
    };
    return Model;
}());
exports.Model = Model;
exports.utils = {
    /**
     *
     * @param field
     * @returns {string | null}
     */
    defaultValue: function (field) {
        var directive = exports.utils.getDirective(field.directives, 'default');
        if (directive) {
            return exports.utils.getArgumentValue(directive.arguments);
        }
        return null;
    },
    /**
     *
     * @param field
     * @returns {string | null}
     */
    relationType: function (field) {
        var directive = exports.utils.getDirective(field.directives, 'relation');
        if (directive) {
            return exports.utils.getArgumentValue(directive.arguments);
        }
        return null;
    },
    /**
     * @param field
     * @return {boolean}
     */
    isUnique: function (field) {
        return exports.utils.getDirective(field.directives, 'unique') === null ? false : true;
    },
    /**
     *
     * @param field
     * @returns {string}
     */
    namedType: function (field) {
        return field.types[field.types.length - 1];
    },
    /**
     *
     * @param field
     * @returns {number}
     */
    isRequired: function (field) {
        return field.types.indexOf('NonNullType') > -1 ? true : false;
    },
    /**
     *
     * @param field
     * @returns {number}
     */
    isList: function (field) {
        return field.types.indexOf('ListType');
    },
    /**
     *
     * @param directives
     * @param kind
     * @returns {DirectiveNode | null}
     */
    getDirective: function (directives, kind) {
        if (directives) {
            for (var i = 0; i < directives.length; i++) {
                var directive = directives[i];
                if (directive.kind === kind) {
                    return directive;
                }
            }
        }
        return null;
    },
    /**
     *
     * @param directiveArguments
     * @returns {string | null}
     */
    getArgumentValue: function (directiveArguments) {
        if (directiveArguments) {
            for (var i = 0; i < directiveArguments.length; i++) {
                if (directiveArguments[i].name.value.toLowerCase() === 'value') {
                    var argument = directiveArguments[i].value;
                    return argument.value;
                }
            }
        }
        return null;
    },
};
//# sourceMappingURL=model.js.map