import _extends from "@babel/runtime/helpers/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
var _excluded = ["prefixCls", "className", "onChange", "direction", "hsva"];
import React from 'react';
import { hsvaToHslaString } from '@uiw/color-convert';
import Alpha from '@uiw/react-color-alpha';
import { jsx as _jsx } from "react/jsx-runtime";
var ShadeSlider = /*#__PURE__*/React.forwardRef((props, ref) => {
  var {
      prefixCls = 'w-color-saturation',
      className,
      onChange: _onChange,
      direction = 'horizontal',
      hsva
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  var colorFrom = hsvaToHslaString(_extends({}, hsva, {
    a: 1,
    v: 100
  }));
  return /*#__PURE__*/_jsx(Alpha, _extends({
    ref: ref
  }, other, {
    className: prefixCls + " " + (className || ''),
    hsva: {
      h: hsva.h,
      s: hsva.s,
      v: hsva.v,
      a: 1 - hsva.v / 100
    },
    direction: direction,
    background: "linear-gradient(to " + (direction === 'horizontal' ? 'right' : 'bottom') + ", " + colorFrom + ", rgb(0, 0, 0))",
    onChange: (_, interaction) => {
      _onChange && _onChange({
        v: direction === 'horizontal' ? 100 - interaction.left * 100 : 100 - interaction.top * 100
      });
    }
  }));
});
ShadeSlider.displayName = 'ShadeSlider';
export default ShadeSlider;