import { cn } from "@/lib/utils";
import React from "react";
import { homeRoute } from "./Home";

interface registrationStage {
    id: number;
    title: string;
}

interface Props {
    homeRoute?: homeRoute;
}

const registrationStages: registrationStage[] = [
    {
        id: 1,
        title: "Profile",
    },
    {
        id: 2,
        title: "Topics",
    },
    {
        id: 3,
        title: "Add-ons",
    },
    {
        id: 4,
        title: "Payment",
    },
    {
        id: 5,
        title: "Done",
    },
];

const Stepper = ({ homeRoute }: Props) => {
    return (
        <div className="flex justify-center space-x-5 md:space-x-10 mb-8 md:mb-12">
            {registrationStages.map((stage) => {
                return (
                    <div
                        key={stage.id}
                        className="flex flex-col items-center text-sm gap-y-2"
                    >
                        <div
                            className={cn(
                                "h-8 w-8 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center",
                                homeRoute === stage.title.toLowerCase() &&
                                    "bg-primary text-secondary"
                            )}
                        >
                            {stage.id}
                        </div>
                        {stage.title}
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
