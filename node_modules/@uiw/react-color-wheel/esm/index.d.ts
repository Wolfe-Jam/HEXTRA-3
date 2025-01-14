import React from 'react';
import { HsvaColor, ColorResult } from '@uiw/color-convert';
import { PointerProps } from './Pointer';
export interface WheelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'color'> {
    prefixCls?: string;
    color?: string | HsvaColor;
    width?: number;
    height?: number;
    radius?: React.CSSProperties['borderRadius'];
    /** Direction of the oval: 'x' or 'y'. */
    oval?: string;
    /** Starting angle of the color wheel's hue gradient, measured in degrees. */
    angle?: number;
    /** Direction of the color wheel's hue gradient; either clockwise or anticlockwise. Default: `anticlockwise` */
    direction?: 'clockwise' | 'anticlockwise';
    pointer?: ({ prefixCls, left, top, color }: PointerProps) => JSX.Element;
    onChange?: (color: ColorResult) => void;
}
declare const Wheel: React.ForwardRefExoticComponent<WheelProps & React.RefAttributes<HTMLDivElement>>;
export default Wheel;
