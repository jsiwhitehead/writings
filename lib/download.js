"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = require("node-fetch");
var fs = require("fs-extra");
// import * as unified from 'unified';
// import * as rehype from 'rehype-parse';
var findTable = function (n) {
    var e_1, _a;
    if (n.type === 'element' && n.tagName === 'tbody')
        return n;
    try {
        for (var _b = __values(n.children || []), _c = _b.next(); !_c.done; _c = _b.next()) {
            var c = _c.value;
            var res = findTable(c);
            if (res)
                return res;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs.readdir('./src/books')];
            case 1:
                files = (_a.sent()).map(function (f) { return f.slice(0, -3); });
                return [4 /*yield*/, fs.ensureDir('./data/downloaded')];
            case 2:
                _a.sent();
                return [4 /*yield*/, Promise.all(files.map(function (f) { return __awaiter(void 0, void 0, void 0, function () {
                        var config, pdf, html;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    config = require("./books/" + f).config;
                                    if (!config.url.endsWith('.pdf')) return [3 /*break*/, 4];
                                    return [4 /*yield*/, node_fetch_1.default(config.url)];
                                case 1: return [4 /*yield*/, (_a.sent()).arrayBuffer()];
                                case 2:
                                    pdf = _a.sent();
                                    return [4 /*yield*/, fs.writeFile("./data/downloaded/" + f + ".pdf", Buffer.from(pdf))];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 8];
                                case 4: return [4 /*yield*/, node_fetch_1.default(config.url)];
                                case 5: return [4 /*yield*/, (_a.sent()).text()];
                                case 6:
                                    html = _a.sent();
                                    return [4 /*yield*/, fs.writeFile("./data/downloaded/" + f + ".html", (config.replace || []).reduce(function (res, _a) {
                                            var _b = __read(_a, 2), a = _b[0], b = _b[1];
                                            return res.replace(a, b);
                                        }, html))];
                                case 7:
                                    _a.sent();
                                    _a.label = 8;
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=download.js.map