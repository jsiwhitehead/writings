"use strict";
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
var utils_1 = require("./utils");
// var chroma = require("chroma-js")
// const [h, c, l] = chroma.hex('e84118').hcl();
// console.log([h, c, l].map(Math.round).join(' '))
var N = [0.95047, 1, 1.08883];
var T = [4 / 29, 6 / 29, 3 * Math.pow((6 / 29), 2)];
var R = Math.PI / 180;
var clean = function (v, max) { return Math.max(0, Math.min(max, Math.round(v))); };
exports.default = (function (color, hex) {
    if (color === void 0) { color = ''; }
    if (hex === void 0) { hex = false; }
    if (!color)
        return null;
    var _a = __read(color
        .split(/\s+/)
        .filter(function (s) { return s; })
        .map(function (s) { return (utils_1.isNumber(s) ? parseFloat(s) : undefined); }), 4), _b = _a[0], h = _b === void 0 ? 0 : _b, _c = _a[1], c = _c === void 0 ? 0 : _c, _d = _a[2], l = _d === void 0 ? 0 : _d, _e = _a[3], o = _e === void 0 ? 100 : _e;
    var r = h * R;
    var a = Math.cos(r) * c;
    var b = Math.sin(r) * c;
    var u = (l + 16) / 116;
    var _f = __read([u + a / 500, u, u - b / 200].map(function (v, i) { return N[i] * (v > T[1] ? Math.pow(v, 3) : T[2] * (v - T[0])); }), 3), x = _f[0], y = _f[1], z = _f[2];
    var rgb = [
        3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
        -0.969266 * x + 1.8760108 * y + 0.041556 * z,
        0.0556434 * x - 0.2040259 * y + 1.0572252 * z,
    ].map(function (v) {
        return clean(255 * (v <= 0.00304 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055), 255);
    });
    if (hex)
        return rgb.map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
    var alpha = clean(o, 100) * 0.01;
    return ((alpha === 1 ? 'rgb(' : 'rgba(') +
        rgb.join(', ') +
        (alpha === 1 ? ')' : ', ' + alpha + ')'));
});
//# sourceMappingURL=color.js.map