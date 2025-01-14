"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHandleRange = getHandleRange;
exports.getWheelDimensions = getWheelDimensions;
exports.getWheelHandlePosition = getWheelHandlePosition;
exports.getWheelValueFromInput = getWheelValueFromInput;
exports.isInputInsideWheel = isInputInsideWheel;
exports.mod = void 0;
exports.translateWheelAngle = translateWheelAngle;
var TAU = Math.PI * 2;

/**
 * javascript's modulo operator doesn't produce positive numbers with negative input
 * https://www.geeksforgeeks.org/how-to-get-negative-result-using-modulo-operator-in-javascript/
 */
var mod = exports.mod = function mod(a, n) {
  return (a % n + n) % n;
};

/** distance between points (x, y) and (0, 0) */
var dist = function dist(x, y) {
  return Math.sqrt(x * x + y * y);
};

/**
 * Get the point as the center of the wheel
 */
function getWheelDimensions(_ref) {
  var _ref$width = _ref.width,
    width = _ref$width === void 0 ? 0 : _ref$width;
  var r = width / 2;
  return {
    width: width,
    radius: r,
    cx: r,
    cy: r
  };
}

/**
 * Returns true if point (x, y) lands inside the wheel
 */
function isInputInsideWheel(props, x, y) {
  var _getWheelDimensions = getWheelDimensions(props),
    cx = _getWheelDimensions.cx,
    cy = _getWheelDimensions.cy,
    width = _getWheelDimensions.width;
  var r = width / 2;
  return dist(cx - x, cy - y) < r;
}

/**
 * Get the current handle position for a given color
 */
function getWheelHandlePosition(props, hsv) {
  var _getWheelDimensions2 = getWheelDimensions(props),
    cx = _getWheelDimensions2.cx,
    cy = _getWheelDimensions2.cy;
  var handleRange = getHandleRange(props);
  var handleAngle = (180 + translateWheelAngle(props, hsv.h, true)) * (TAU / 360);
  var handleDist = hsv.s / 100 * handleRange;
  var direction = props.direction === 'clockwise' ? -1 : 1;
  return {
    x: cx + handleDist * Math.cos(handleAngle) * direction,
    y: cy + handleDist * Math.sin(handleAngle) * direction
  };
}

/**
 * Get Range
 */
function getHandleRange(_ref2) {
  var _ref2$width = _ref2.width,
    width = _ref2$width === void 0 ? 0 : _ref2$width;
  return width / 2;
}

/**
 * Translate an angle according to wheelAngle and wheelDirection
 */
function translateWheelAngle(props, angle, invert) {
  var wheelAngle = props.angle || 0;
  var direction = props.direction;
  // inverted and clockwisee
  if (invert && direction === 'clockwise') angle = wheelAngle + angle;
  // clockwise (input handling)
  else if (direction === 'clockwise') angle = 360 - wheelAngle + angle;
  // inverted and anticlockwise
  else if (invert && direction === 'anticlockwise') angle = wheelAngle + 180 - angle;
  // anticlockwise (input handling)
  else if (direction === 'anticlockwise') angle = wheelAngle - angle;
  return mod(angle, 360);
}

/**
 * Get the current wheel value from user input
 * @param props - wheel props
 * @param x - global input x position
 * @param y - global input y position
 */
function getWheelValueFromInput(props, x, y) {
  var _getWheelDimensions3 = getWheelDimensions(props),
    cx = _getWheelDimensions3.cx,
    cy = _getWheelDimensions3.cy;
  var handleRange = getHandleRange(props);
  x = cx - x;
  y = cy - y;
  // Calculate the hue by converting the angle to radians
  var hue = translateWheelAngle(props, Math.atan2(-y, -x) * (360 / TAU));
  // Find the point's distance from the center of the wheel
  // This is used to show the saturation level
  var handleDist = Math.min(dist(x, y), handleRange);
  return {
    h: Math.round(hue),
    s: Math.round(100 / handleRange * handleDist)
  };
}