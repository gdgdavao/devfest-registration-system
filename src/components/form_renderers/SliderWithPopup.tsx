import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

interface SliderWithPopupProps
    extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

const SliderWithPopup = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderWithPopupProps
>(({ className, ...props }, ref) => {
    const [value, setValue] = React.useState([50]);

    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        setOpen(true);

        const timer = setTimeout(() => {
            setOpen(false);
        }, 2000);

        return () => {
            clearTimeout(timer);
        };
    }, [value]);
    const getTooltipText = () => {
        switch (value[0]) {
            case 0:
                return "Very Uninterested";
            case 25:
                return "Somewhat Uninterested";
            case 50:
                return "Neutral";
            case 75:
                return "Somewhat Interested";
            case 100:
                return "Very Interested";
        }
    };
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <SliderPrimitive.Root
                ref={ref}
                className={cn(
                    "relative flex w-full touch-none select-none items-center",
                    className
                )}
                max={100}
                step={100 / 4}
                value={value}
                onValueChange={setValue}
                {...props}
            >
                <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
                    <SliderPrimitive.Range className="absolute h-full bg-primary" />
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
                        <p>{getTooltipText()}</p>
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Root>
            </SliderPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
});
SliderWithPopup.displayName = SliderPrimitive.Root.displayName;

export default SliderWithPopup;
