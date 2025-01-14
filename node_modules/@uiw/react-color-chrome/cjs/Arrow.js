"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Arrow;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["style"];
function Arrow(props) {
  var style = props.style,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var btn = (0, _react.useRef)(null);
  var handleMouseEnter = (0, _react.useCallback)(function () {
    btn.current.style['backgroundColor'] = 'var(--chrome-arrow-background-color)';
  }, []);
  var handleMouseLeave = (0, _react.useCallback)(function () {
    btn.current.style['backgroundColor'] = 'transparent';
  }, []);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", (0, _objectSpread2["default"])((0, _objectSpread2["default"])({
    ref: btn,
    style: (0, _objectSpread2["default"])({
      marginLeft: 5,
      cursor: 'pointer',
      transition: 'background-color .3s',
      borderRadius: 2
    }, style)
  }, other), {}, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)("svg", {
      viewBox: "0 0 1024 1024",
      width: "24",
      height: "24",
      style: {
        display: 'block'
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
        d: "M373.888 576h276.224c9.322667 0 14.293333 11.178667 9.173333 18.773333l-1.258666 1.557334-138.112 146.858666a10.709333 10.709333 0 0 1-14.293334 1.365334l-1.536-1.365334-138.112-146.858666c-6.592-6.997333-2.666667-18.645333 5.973334-20.16l1.941333-0.170667h276.224-276.224z m146.026667-295.189333l138.112 146.858666c7.04 7.509333 2.069333 20.330667-7.914667 20.330667H373.888c-9.984 0-14.976-12.821333-7.914667-20.330667l138.112-146.858666a10.730667 10.730667 0 0 1 15.829334 0z",
        fill: "var(--chrome-arrow-fill)"
      })
    })
  }));
}
module.exports = exports.default;