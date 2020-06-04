"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInteger = exports.split = exports.toNumber = exports.isNumber = void 0;
exports.isNumber = function (x) { return !isNaN(x) && !isNaN(parseFloat(x)); };
exports.toNumber = function (s) { return (exports.isNumber(s) ? parseFloat(s) : 0); };
exports.split = function (s) { return (s || '').split(/\s+/).filter(function (v) { return v; }); };
exports.isInteger = function (x) {
    if (!exports.isNumber(x))
        return false;
    var n = parseFloat(x);
    return Math.floor(n) === n;
};
//# sourceMappingURL=utils.js.map