"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pointer = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = _interopRequireDefault(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
var BOXSHADOW = 'rgb(255 255 255) 0px 0px 0px 1.5px, rgb(0 0 0 / 30%) 0px 0px 1px 1px inset, rgb(0 0 0 / 40%) 0px 0px 1px 2px';
var Pointer = exports.Pointer = function Pointer(_ref) {
  var className = _ref.className,
    color = _ref.color,
    left = _ref.left,
    top = _ref.top,
    style = _ref.style,
    prefixCls = _ref.prefixCls;
  var styleWarp = (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, style), {}, {
    position: 'absolute',
    top: top,
    left: left
  });
  var cls = "".concat(prefixCls, "-pointer ").concat(className || '');
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: cls,
    style: styleWarp,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "".concat(prefixCls, "-fill"),
      style: {
        width: 10,
        height: 10,
        transform: 'translate(-5px, -5px)',
        boxShadow: BOXSHADOW,
        borderRadius: '50%',
        backgroundColor: '#fff'
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        style: {
          inset: 0,
          borderRadius: '50%',
          position: 'absolute',
          backgroundColor: color
        }
      })
    })
  });
};