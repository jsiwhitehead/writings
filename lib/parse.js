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
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var unified = require("unified");
var rehype = require("rehype-parse");
var elements = {
    tags: {
        p: 'p',
        blockquote: 'p',
        hr: 'p',
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        h4: 'h4',
        h5: 'h5',
        h6: 'h6',
        u: 'u',
        em: 'i',
        i: 'i',
        strong: 'b',
        b: 'b',
        a: 'ignore',
        sup: 'n',
    },
    classes: {
        'brl-margin-2': 'q',
        'brl-title': 'h2',
        'brl-head': 'h3',
        'brl-italic': 'i',
        'brl-align-center': 'c',
        'brl-align-right': 'r',
        'brl-linegroup': 'p',
        'brl-linegroupline': 'l',
    },
};
var findChild = function (node, test) {
    var e_1, _a;
    if (node.type !== 'element')
        return null;
    try {
        for (var _b = __values(node.children), _c = _b.next(); !_c.done; _c = _b.next()) {
            var c = _c.value;
            if (c.type === 'element' && test(c))
                return c;
            var sub = findChild(c, test);
            if (sub)
                return sub;
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
var getNoteId = function (node) {
    if (node.tagName === 'li' &&
        !findChild(node, function (x) { return x.tagName === 'ul'; }) &&
        findChild(node, function (x) {
            return (x.properties.className || []).includes('brl-returntotext');
        })) {
        return findChild(node, function (x) {
            return x.tagName === 'a' &&
                (x.properties.className || []).includes('brl-location') &&
                x.properties.id;
        }).properties.id;
    }
};
var getGaps = function (node) {
    var result = { above: node.tagName === 'hr' ? 5 : 0, below: 0 };
    if ((node.properties.className || []).includes('brl-topmargin')) {
        result.above += 1;
    }
    if ((node.properties.className || []).includes('brl-btmmargin')) {
        result.below += 1;
    }
    return result;
};
var parse = function (data) {
    var notes = {};
    var walk = function (items, children, output) {
        return children.forEach(function (node) {
            if (node.type === 'text') {
                if (output) {
                    var last = items[items.length - 1].content;
                    last[last.length - 1].content += node.value.replace(/\s+/g, ' ');
                }
            }
            else if (node.type === 'element') {
                var note = getNoteId(node);
                if (note) {
                    notes[note] = walkFull(node.children, {
                        type: 'p',
                        gap: 0,
                        content: [{ content: '' }],
                    });
                }
                else {
                    var type = elements.tags[node.tagName] ||
                        (node.properties.className || [])
                            .map(function (c) { return elements.classes[c]; })
                            .filter(function (x) { return x; })[0];
                    if (type !== 'ignore') {
                        var gaps = getGaps(node);
                        if (gaps.above)
                            items[items.length - 1].gap += gaps.above;
                        if (['p', 'q', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(type)) {
                            items.push({ type: type, gap: 0, content: [{ content: '' }] });
                            walk(items, node.children, true);
                        }
                        else if (type === 'n') {
                            items[items.length - 1].content.push({
                                type: type,
                                content: node.children[0].properties.href.slice(1),
                            }, { content: '' });
                        }
                        else if (type) {
                            items[items.length - 1].content.push({ type: type, content: '' });
                            walk(items, node.children, output);
                            items[items.length - 1].content.push({ content: '' });
                        }
                        else {
                            walk(items, node.children, output);
                        }
                        if (gaps.below)
                            items[items.length - 1].gap += gaps.below;
                    }
                }
            }
        });
    };
    var walkFull = function (children, first) {
        var items = first ? [first] : [];
        walk(items, children, false);
        for (var i = items.length - 1; i >= 0; i--) {
            if (items[i].gap > 1) {
                items.splice(i + 1, 0, { type: 'divide', content: '*' });
            }
            delete items[i].gap;
        }
        return items
            .map(function (x) {
            var content = x.content.filter(function (y) { return y.content.trim(); });
            if (content.length) {
                content[0].content = content[0].content.trimLeft();
                content[content.length - 1].content = content[content.length - 1].content.trimRight();
            }
            return __assign(__assign({}, x), { content: content });
        })
            .filter(function (x) { return x.content.length; });
    };
    return { items: walkFull(data), notes: notes };
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs.readdir('./src/books')];
            case 1:
                files = (_a.sent()).map(function (f) { return f.slice(0, -3); });
                return [4 /*yield*/, fs.ensureDir('./data/parsed')];
            case 2:
                _a.sent();
                return [4 /*yield*/, Promise.all(files.map(function (f) { return __awaiter(void 0, void 0, void 0, function () {
                        var html, data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fs.readFile("./data/downloaded/" + f + ".html", 'utf8')];
                                case 1:
                                    html = _a.sent();
                                    data = parse(unified().use(rehype, { footnotes: true }).parse(html).children);
                                    return [4 /*yield*/, fs.writeFile("./data/parsed/" + f + ".json", JSON.stringify(data, null, 2))];
                                case 2:
                                    _a.sent();
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
//# sourceMappingURL=parse.js.map