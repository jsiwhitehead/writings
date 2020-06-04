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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var maraca_1 = require("maraca");
var webfont = require("webfontloader");
var roman_numbers_1 = require("roman-numbers");
var color_1 = require("./color");
webfont.load({
    google: { families: ['PT+Serif:400,700'] },
});
var configs = [
    {
        file: '50-100',
        title: function (index, change) {
            if (change === 0)
                return roman_numbers_1.arabToRoman(index[0]);
            if (index[0] === 1 && change === 1)
                return '⭑';
        },
        format: function (level) { return ({ center: level === 0 }); },
    },
    {
        file: 'frontiers-learning',
        numbers: 2,
        format: function (level) { return ({
            center: level === 0,
            caps: level <= 1,
            italic: level >= 3,
        }); },
    },
    {
        file: 'learning-growth',
        title: function (index, change) {
            if (change === 0 && index[0] > 2)
                return roman_numbers_1.arabToRoman(index[0] - 2);
        },
        format: function (level) { return ({
            center: level <= 1,
        }); },
    },
];
var getIndexChange = function (prev, next) {
    if (!prev)
        return 0;
    return Array.from({ length: Math.max(prev.length, next.length) }).findIndex(function (_, i) { return prev[i] !== next[i]; });
};
var nestContent = function (content, spans) {
    if (spans === void 0) { spans = []; }
    var sorted = spans.sort(function (a, b) { return a.start - b.start; });
    var result = sorted.reduce(function (res, _a, i) {
        var start = _a.start, end = _a.end, info = __rest(_a, ["start", "end"]);
        return __spread(res, [
            { content: content.slice(i === 0 ? 0 : sorted[i - 1].end, start) },
            __assign(__assign({}, info), { content: content.slice(start, end) }),
        ]);
    }, []);
    result.push({
        content: sorted.length
            ? content.slice(sorted[sorted.length - 1].end)
            : content,
    });
    return result.filter(function (x) { return x.content; });
};
var process = function (config) {
    var data = require("../../data/flattened/" + config.file + ".json");
    var titles = __assign({}, data.titles);
    var items = [];
    var baseIndex = [-1];
    data.items.forEach(function (x, i) {
        var _a, _b, _c;
        var itemTitles = Object.keys(titles)
            .filter(function (t) { return x.index.join('.').startsWith(t); })
            .sort(function (a, b) { return a.length - b.length; });
        var change = getIndexChange((_a = data.items[i - 1]) === null || _a === void 0 ? void 0 : _a.index, x.index);
        if (change >= baseIndex.length) {
            Array.from({ length: change + 1 }).forEach(function (_, i) {
                baseIndex[i] = baseIndex[i] || 0;
            });
        }
        else {
            baseIndex = baseIndex.slice(0, change + 1);
        }
        baseIndex[change]++;
        var titleContent = (_b = config.title) === null || _b === void 0 ? void 0 : _b.call(config, x.index, change);
        if (titleContent) {
            items.push(__assign(__assign({ title: true }, (_c = config.format) === null || _c === void 0 ? void 0 : _c.call(config, change)), { index: x.index.slice(0, change + 1), content: nestContent(titleContent) }));
        }
        itemTitles.forEach(function (t) {
            var _a;
            var index = t === '1' ? [] : t.split('.');
            items.push(__assign(__assign({ title: true }, (_a = config.format) === null || _a === void 0 ? void 0 : _a.call(config, index.length)), { index: index, content: __spread((index.length > 0 && index.length <= config.numbers
                    ? [
                        {
                            content: "" + baseIndex.join('.') + (baseIndex.length === 1 ? '.' : '') + " ",
                        },
                    ]
                    : []), nestContent(titles[t].content)) }));
            delete titles[t];
        });
        items.push(__assign(__assign({}, x), { content: nestContent(x.content, x.spans) }));
    });
    return __assign(__assign({}, data), { items: items });
};
var map = function (func) {
    return maraca_1.fromJs(function (x) { return maraca_1.streamMap(function (get) { return maraca_1.fromJs(func(maraca_1.resolve(x, get))); }); });
};
exports.default = {
    data: maraca_1.fromJs(configs.map(function (c) { return process(c); })),
    hcl: map(function (color) { return color_1.default(color.type === 'value' ? color.value : ''); }),
    simple: map(function (s) {
        return (maraca_1.toJs(s, 'string') || '').replace(/\s+/g, '-').toLowerCase();
    }),
};
//# sourceMappingURL=streams.js.map