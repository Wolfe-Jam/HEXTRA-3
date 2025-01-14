import _extends from "@babel/runtime/helpers/extends";
import React from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
var BOXSHADOW = 'rgb(255 255 255) 0px 0px 0px 1.5px, rgb(0 0 0 / 30%) 0px 0px 1px 1px inset, rgb(0 0 0 / 40%) 0px 0px 1px 2px';
export var Pointer = _ref => {
  var {
    className,
    color,
    left,
    top,
    style,
    prefixCls
  } = _ref;
  var styleWarp = _extends({}, style, {
    position: 'absolute',
    top,
    left
  });
  var cls = prefixCls + "-pointer " + (className || '');
  return /*#__PURE__*/_jsx("div", {
    className: cls,
    style: styleWarp,
    children: /*#__PURE__*/_jsx("div", {
      className: prefixCls + "-fill",
      style: {
        width: 10,
        height: 10,
        transform: 'translate(-5px, -5px)',
        boxShadow: BOXSHADOW,
        borderRadius: '50%',
        backgroundColor: '#fff'
      },
      children: /*#__PURE__*/_jsx("div", {
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