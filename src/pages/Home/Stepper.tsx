import { useFormGroupsQuery } from "@/client";
import { cn } from "@/lib/utils";

const Stepper = ({ index }: { index: number }) => {
    const { data: groups } = useFormGroupsQuery();

    return (
        <div className="flex justify-center space-x-5 md:space-x-10 mb-8 md:mb-12">
            {(groups ?? []).filter(g => g.show_in_stepper)
                .map((group, sIdx) => {
                    return (
                        <div
                            key={sIdx + 1}
                            className="flex flex-col items-center text-sm gap-y-2"
                        >
                            <div
                                className={cn(
                                    "font-mono h-8 w-8 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center",
                                    index - 1 === sIdx &&
                                        "bg-primary text-secondary"
                                )}
                            >
                                {sIdx + 1}
                            </div>
                            {group.short_title ?? group.title ?? ''}
                        </div>
                    );
                })}
        </div>
    );
};

export default Stepper;
