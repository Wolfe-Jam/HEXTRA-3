import React from 'react';
export interface PointerProps extends React.HTMLAttributes<HTMLDivElement> {
    prefixCls?: string;
    top?: string;
    left: string;
    color?: string;
}
export declare const Pointer: ({ className, color, left, top, style, prefixCls }: PointerProps) => JSX.Element;
