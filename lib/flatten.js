"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var maraca_1 = require("maraca");
var toJson = function (data, simple) {
    if (simple === void 0) { simple = false; }
    if (data.type === 'value')
        return data.value;
    var values = {};
    Object.keys(data.value.values).forEach(function (k) {
        var e_1, _a;
        var _b = data.value.values[k], key = _b.key, value = _b.value;
        if (!k) {
            var v = toJson(value);
            if (typeof v === 'string') {
                try {
                    for (var _c = __values(v.split(' ')), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var t = _d.value;
                        values[t] = 1;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        else {
            values[key.value] = toJson(value, true);
        }
    });
    var result = { indices: data.value.indices.map(function (d) { return toJson(d); }), values: values };
    if (simple) {
        if (result.indices.length === 0)
            return result.values;
        if (Object.keys(result.values).length === 0)
            return result.indices;
    }
    return result;
};
var flattenDocument = function (data) {
    var items = [];
    var titles = { 1: { content: data.values.title } };
    var walk = function (data, index, base, inContent) {
        if (index === void 0) { index = 0; }
        if (base === void 0) { base = { index: [] }; }
        if (inContent === void 0) { inContent = false; }
        if (inContent) {
            if (typeof data === 'string') {
                items[items.length - 1].content += data;
            }
            else {
                var indices = data.indices, values_1 = data.values;
                var span = __assign({ start: items[items.length - 1].content.length }, values_1);
                indices.forEach(function (d, i) { return walk(d, i, values_1, true); });
                span.end = items[items.length - 1].content.length;
                items[items.length - 1].spans = items[items.length - 1].spans || [];
                items[items.length - 1].spans.push(span);
            }
        }
        else {
            if (typeof data === 'string') {
                items.push(__assign(__assign({ content: data }, base), { index: __spread(base.index, [index + 1]) }));
            }
            else {
                var indices = data.indices, values = data.values;
                var newBase_1 = __assign(__assign(__assign({}, base), values), { index: __spread(base.index, [index + 1]), list: (base.list || 0) + (values.list || 0) });
                delete newBase_1.title;
                if (!newBase_1.list)
                    delete newBase_1.list;
                if (values.title) {
                    titles[newBase_1.index.join('.')] = { content: values.title };
                }
                var newContent_1 = indices.every(function (d) {
                    return typeof d === 'string' ||
                        Object.keys(d.values).filter(function (k) { return !['i', 'b', 'q'].includes(k); })
                            .length === 0;
                }) &&
                    indices.some(function (d) {
                        return typeof d !== 'string' && ['i', 'b', 'q'].some(function (k) { return d.values[k]; });
                    });
                if (newContent_1)
                    items.push(__assign({ content: '' }, newBase_1));
                indices.forEach(function (d, i) { return walk(d, i, newBase_1, newContent_1); });
            }
        }
    };
    data.indices.forEach(function (d, i) { return walk(d, i); });
    return __assign(__assign({}, data.values), { titles: titles, items: items });
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs.readdir('./writings')];
            case 1:
                files = (_a.sent()).map(function (f) { return f.slice(0, -3); });
                return [4 /*yield*/, fs.ensureDir('./data/flattened')];
            case 2:
                _a.sent();
                return [4 /*yield*/, Promise.all(files.map(function (f) { return __awaiter(void 0, void 0, void 0, function () {
                        var data, _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = toJson;
                                    _b = maraca_1.default;
                                    return [4 /*yield*/, fs.readFile("./writings/" + f + ".ma", 'utf8')];
                                case 1:
                                    data = _a.apply(void 0, [_b.apply(void 0, [_c.sent()])]);
                                    return [4 /*yield*/, fs.writeFile("./data/flattened/" + f + ".json", JSON.stringify(data.values.documents
                                            ? data.indices.map(flattenDocument)
                                            : flattenDocument(data), null, 2))];
                                case 2:
                                    _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=flatten.js.map