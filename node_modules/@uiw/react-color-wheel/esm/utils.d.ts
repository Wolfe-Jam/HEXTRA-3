import { HsvColor } from '@uiw/color-convert';
import { WheelProps } from './';
/**
 * javascript's modulo operator doesn't produce positive numbers with negative input
 * https://www.geeksforgeeks.org/how-to-get-negative-result-using-modulo-operator-in-javascript/
 */
export declare const mod: (a: number, n: number) => number;
/**
 * Get the point as the center of the wheel
 */
export declare function getWheelDimensions({ width }: Partial<WheelProps>): {
    width: number;
    radius: number;
    cx: number;
    cy: number;
};
/**
 * Returns true if point (x, y) lands inside the wheel
 */
export declare function isInputInsideWheel(props: Partial<WheelProps>, x: number, y: number): boolean;
/**
 * Get the current handle position for a given color
 */
export declare function getWheelHandlePosition(props: Partial<WheelProps>, hsv: HsvColor): {
    x: number;
    y: number;
};
/**
 * Get Range
 */
export declare function getHandleRange({ width }: Partial<WheelProps>): number;
/**
 * Translate an angle according to wheelAngle and wheelDirection
 */
export declare function translateWheelAngle(props: Partial<WheelProps>, angle: number, invert?: boolean): number;
/**
 * Get the current wheel value from user input
 * @param props - wheel props
 * @param x - global input x position
 * @param y - global input y position
 */
export declare function getWheelValueFromInput(props: Partial<WheelProps>, x: number, y: number): {
    h: number;
    s: number;
};
