import { useState, useEffect } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import throttle from 'lodash.throttle';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import tailwindConfig from '../../tailwind.config.js';

const findKeyByValue = (object: Record<string, never>, value: string) =>
    Object.keys(object).find((key) => object[key] === value)

const getDeviceConfig = (width: number): string | null => {
    const fullConfig = resolveConfig(tailwindConfig)
    const { screens } = fullConfig.theme

    const bpSizes = Object.keys(screens).map((screenSize) =>
        parseInt(screens[screenSize])
    )

    const bpShapes = bpSizes.map((size, index) => ({
        min: !index ? 0 : bpSizes[index - 1],
        max: size,
        key: findKeyByValue(screens, `${size}px`),
    }))

    let breakpoint = null

    bpShapes.forEach((shape) => {
        if (!shape.min && width < shape.max) {
            breakpoint = shape.key
        } else if (width >= shape.min && width < shape.max) {
            breakpoint = shape.key
        } else if (!shape.max && width >= shape.max) {
            breakpoint = shape.key
        }
    })

    return breakpoint
}

const useTailwindBreakpoint = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const [brkPnt, setBrkPnt] = useState(() => getDeviceConfig(width));

    useEffect(() => {
        const calcInnerWidth = throttle(function () {
            setBrkPnt(getDeviceConfig(window.innerWidth))
        }, 200)
        window.addEventListener('resize', calcInnerWidth)
        return () => window.removeEventListener('resize', calcInnerWidth);
    }, []);

    return brkPnt;
}

export default useTailwindBreakpoint
