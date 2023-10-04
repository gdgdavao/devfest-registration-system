import { useMemo, useState, useEffect, ElementRef, forwardRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

interface SliderWithPopupProps {
    className?: string
    values: string[]
    onChange: (val: string) => void
    value?: string
}

const MAX_NUMBER = 100;

const LikertSlider = forwardRef<
    ElementRef<typeof SliderPrimitive.Root>,
    SliderWithPopupProps
>(({ className, onChange, values, value }, ref) => {
    const [open, setOpen] = useState(false);
    const steps = useMemo(() => Math.abs(Math.floor(MAX_NUMBER / (values.length - 1))), [values]);
    const nValue = useMemo(() => [Math.max(values.indexOf(value ?? values[0]), 0) * steps], [values, value, steps]);
    const valueIdx = useMemo(() => nValue[0] / steps, [nValue, steps]);

    useEffect(() => {
        if (!value) {
            onChange(values[0]);
            return;
        }
    }, [value, values]);

    useEffect(() => {
        setOpen(true);
        const timer = setTimeout(() => {
            setOpen(false);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [valueIdx]);

    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <SliderPrimitive.Root
                ref={ref}
                className={cn(
                    "relative flex w-full touch-none select-none items-center",
                    className
                )}
                max={MAX_NUMBER}
                step={steps}
                value={nValue}
                onValueChange={(val) => onChange(values[val[0] / steps])}
            >
                <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                    <SliderPrimitive.Range className={cn("absolute h-full bg-primary", {
                        'bg-red-400': valueIdx === 0,
                        'bg-amber-400': valueIdx === 1,
                        'bg-blue-400': valueIdx === 3,
                        'bg-green-400': valueIdx === 4
                    })} />
                </SliderPrimitive.Track>

                <TooltipPrimitive.Root open={open}>
                    <TooltipPrimitive.Trigger asChild>
                        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
                    </TooltipPrimitive.Trigger>

                    <TooltipPrimitive.Content
                        side="top"
                        sideOffset={5}
                        className="overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    >
                        <p>{values[valueIdx]}</p>
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Root>
            </SliderPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
});

LikertSlider.displayName = SliderPrimitive.Root.displayName;

export default LikertSlider;
