import React from "react";
import Title from "./Title";
import Alert from "@/components/ui/alert";
import UserType from "./UserType";
import { useFormContext } from "react-hook-form";

const Welcome: React.FC = () => {
    const form = useFormContext();
    return (
        <div className="flex flex-col space-y-4">
            <Title
                title="Welcome to DevFest 2023 Registration!"
                description="Corem ipsum dolor sit amet, consectetur adipiscing elit."
            />

            <Alert
                icon="Info"
                className="text-left"
                description="Registering for GDG Davao DevFest 2023 doesn't guarantee you a spot. We'll review all registrations to ensure that everyone has an equal chance to attend."
            />
            <div className="mx-auto w-full overflow-x-auto">
                <div className="flex w-auto gap-x-4">
                    <UserType title="Student" />
                    <UserType title="Professional" />
                </div>
            </div>
        </div>
    );
};

export default Welcome;
