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
var _reactColorEditableInput = _interopRequireDefault(require("@uiw/react-color-editable-input"));
var _reactColorEditableInputRgba = _interopRequireDefault(require("@uiw/react-color-editable-input-rgba"));
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["prefixCls", "className", "style", "color", "onChange"];
var styleRBG = {
  boxShadow: 'initial',
  borderWidth: '0 0 1px 0',
  borderBottomColor: 'var(--material-border-bottom-color)',
  borderBottomStyle: 'solid',
  height: 30,
  outline: 0,
  fontSize: 15,
  padding: 0
};
var Material = /*#__PURE__*/_react["default"].forwardRef(function (props, ref) {
  var _props$prefixCls = props.prefixCls,
    prefixCls = _props$prefixCls === void 0 ? 'w-color-material' : _props$prefixCls,
    className = props.className,
    style = props.style,
    color = props.color,
    onChange = props.onChange,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var hsva = typeof color === 'string' && (0, _colorConvert.validHex)(color) ? (0, _colorConvert.hexToHsva)(color) : color;
  var hex = color ? (0, _colorConvert.hsvaToHex)(hsva).replace(/^#/, '') : '';
  var handleChange = function handleChange(hsv) {
    onChange && onChange((0, _colorConvert.color)(hsv));
  };
  var handleHex = function handleHex(value, evn) {
    if (typeof value === 'string' && (0, _colorConvert.validHex)(value) && /(3|6)/.test(String(value.length))) {
      onChange && onChange((0, _colorConvert.color)((0, _colorConvert.hexToHsva)(value)));
    }
  };
  var styleWrapper = (0, _objectSpread2["default"])({
    '--material-border-bottom-color': '#eee',
    '--material-background-color': '#fff',
    padding: 16,
    width: 98,
    fontFamily: 'Roboto',
    backgroundColor: 'var(--material-background-color)'
  }, style);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", (0, _objectSpread2["default"])((0, _objectSpread2["default"])({
    ref: ref,
    className: [prefixCls, className || ''].filter(Boolean).join(' '),
    style: styleWrapper
  }, other), {}, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactColorEditableInput["default"], {
      label: "Hex",
      value: hex.toLocaleUpperCase(),
      onChange: function onChange(evn, val) {
        return handleHex(val, evn);
      },
      onBlur: function onBlur(evn) {
        var value = evn.target.value;
        evn.target.value = value.slice(0, 6);
        handleHex(value.slice(0, 6), evn);
      },
      inputStyle: {
        outline: 0,
        border: 0,
        height: 30,
        fontSize: 15,
        padding: 0,
        boxShadow: 'initial',
        borderWidth: '0 0 2px 0',
        borderBottomColor: hex ? "#".concat(hex) : 'var(--material-border-bottom-color)',
        borderBottomStyle: 'solid',
        background: 'transparent'
      },
      style: {
        flexDirection: 'column-reverse',
        alignItems: 'flex-start'
      }
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactColorEditableInputRgba["default"], {
      hsva: hsva,
      placement: "top",
      style: {
        marginTop: 11
      },
      rProps: {
        style: {
          alignItems: 'flex-start'
        },
        inputStyle: (0, _objectSpread2["default"])({}, styleRBG)
      },
      gProps: {
        style: {
          alignItems: 'flex-start'
        },
        inputStyle: (0, _objectSpread2["default"])({}, styleRBG)
      },
      bProps: {
        style: {
          alignItems: 'flex-start'
        },
        inputStyle: (0, _objectSpread2["default"])({}, styleRBG)
      },
      aProps: false,
      onChange: function onChange(result) {
        return handleChange(result.hsva);
      }
    })]
  }));
});
Material.displayName = 'Material';
var _default = exports["default"] = Material;
module.exports = exports.default;