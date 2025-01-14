import React from 'react';
import { AlphaProps } from '@uiw/react-color-alpha';
export interface ShadeSliderProps extends Omit<AlphaProps, 'onChange'> {
    onChange?: (newShade: {
        v: number;
    }) => void;
}
declare const ShadeSlider: React.ForwardRefExoticComponent<ShadeSliderProps & React.RefAttributes<HTMLDivElement>>;
export default ShadeSlider;
