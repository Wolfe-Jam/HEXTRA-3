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
var _reactDragEventInteractive = _interopRequireDefault(require("@uiw/react-drag-event-interactive"));
var _Pointer = require("./Pointer");
var _utils = require("./utils");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["prefixCls", "radius", "pointer", "className", "style", "width", "height", "oval", "direction", "angle", "color", "onChange"];
var HUE_GRADIENT_CLOCKWISE = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';
var HUE_GRADIENT_ANTICLOCKWISE = 'conic-gradient(red, magenta, blue, aqua, lime, yellow, red)';
var Wheel = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
  var _props$prefixCls = props.prefixCls,
    prefixCls = _props$prefixCls === void 0 ? 'w-color-wheel' : _props$prefixCls,
    _props$radius = props.radius,
    radius = _props$radius === void 0 ? 0 : _props$radius,
    pointer = props.pointer,
    className = props.className,
    style = props.style,
    _props$width = props.width,
    width = _props$width === void 0 ? 200 : _props$width,
    _props$height = props.height,
    height = _props$height === void 0 ? 200 : _props$height,
    oval = props.oval,
    _props$direction = props.direction,
    direction = _props$direction === void 0 ? 'anticlockwise' : _props$direction,
    _props$angle = props.angle,
    angle = _props$angle === void 0 ? 180 : _props$angle,
    color = props.color,
    onChange = props.onChange,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var hsva = typeof color === 'string' && (0, _colorConvert.validHex)(color) ? (0, _colorConvert.hexToHsva)(color) : color || {};
  var hex = color ? (0, _colorConvert.hsvaToHex)(hsva) : '';
  var positions = (0, _utils.getWheelHandlePosition)({
    width: width
  }, hsva);
  var comProps = {
    top: '0',
    left: '0',
    color: hex
  };
  var handleChange = function handleChange(interaction, event) {
    var result = (0, _utils.getWheelValueFromInput)({
      width: width
    }, width - interaction.x, height - interaction.y);
    var handleHsva = {
      h: result.h,
      s: result.s,
      v: hsva.v,
      a: hsva.a
    };
    onChange && onChange((0, _colorConvert.color)(handleHsva));
  };
  var pointerStyle = {
    zIndex: 1,
    transform: "translate(".concat(positions.x, "px, ").concat(positions.y, "px) ").concat(oval === 'x' || oval === 'X' ? 'scaleY(2)' : oval === 'y' || oval === 'Y' ? 'scaleX(2)' : '')
  };
  var pointerElement = pointer && typeof pointer === 'function' ? pointer((0, _objectSpread2["default"])({
    prefixCls: prefixCls,
    style: pointerStyle
  }, comProps)) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Pointer.Pointer, (0, _objectSpread2["default"])({
    prefixCls: prefixCls,
    style: pointerStyle
  }, comProps));
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactDragEventInteractive["default"], (0, _objectSpread2["default"])((0, _objectSpread2["default"])({
    className: [prefixCls, className || ''].filter(Boolean).join(' ')
  }, other), {}, {
    style: (0, _objectSpread2["default"])({
      position: 'relative',
      width: width,
      transform: oval === 'x' || oval === 'X' ? 'scaleY(0.5)' : oval === 'y' || oval === 'Y' ? 'scaleX(0.5)' : '',
      height: height
    }, style),
    ref: ref,
    onMove: handleChange,
    onDown: handleChange,
    children: [pointerElement, /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      style: {
        position: 'absolute',
        borderRadius: '50%',
        background: direction === 'anticlockwise' ? HUE_GRADIENT_CLOCKWISE : HUE_GRADIENT_ANTICLOCKWISE,
        transform: "rotateZ(".concat(angle + 90, "deg)"),
        inset: 0
      }
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      style: {
        position: 'absolute',
        borderRadius: '50%',
        background: 'radial-gradient(circle closest-side, #fff, transparent)',
        inset: 0
      }
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      style: {
        backgroundColor: '#000',
        borderRadius: '50%',
        position: 'absolute',
        inset: 0,
        opacity: typeof hsva.v === 'number' ? 1 - hsva.v / 100 : 0
      }
    })]
  }));
});
Wheel.displayName = 'Wheel';
var _default = exports["default"] = Wheel;
module.exports = exports.default;