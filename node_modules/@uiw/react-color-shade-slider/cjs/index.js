"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireDefault(require("react"));
var _colorConvert = require("@uiw/color-convert");
var _reactColorAlpha = _interopRequireDefault(require("@uiw/react-color-alpha"));
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["prefixCls", "className", "onChange", "direction", "hsva"];
var ShadeSlider = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
  var _props$prefixCls = props.prefixCls,
    prefixCls = _props$prefixCls === void 0 ? 'w-color-saturation' : _props$prefixCls,
    className = props.className,
    _onChange = props.onChange,
    _props$direction = props.direction,
    direction = _props$direction === void 0 ? 'horizontal' : _props$direction,
    hsva = props.hsva,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var colorFrom = (0, _colorConvert.hsvaToHslaString)((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, hsva), {}, {
    a: 1,
    v: 100
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactColorAlpha["default"], (0, _objectSpread2["default"])((0, _objectSpread2["default"])({
    ref: ref
  }, other), {}, {
    className: "".concat(prefixCls, " ").concat(className || ''),
    hsva: {
      h: hsva.h,
      s: hsva.s,
      v: hsva.v,
      a: 1 - hsva.v / 100
    },
    direction: direction,
    background: "linear-gradient(to ".concat(direction === 'horizontal' ? 'right' : 'bottom', ", ").concat(colorFrom, ", rgb(0, 0, 0))"),
    onChange: function onChange(_, interaction) {
      _onChange && _onChange({
        v: direction === 'horizontal' ? 100 - interaction.left * 100 : 100 - interaction.top * 100
      });
    }
  }));
});
ShadeSlider.displayName = 'ShadeSlider';
var _default = exports["default"] = ShadeSlider;
module.exports = exports.default;