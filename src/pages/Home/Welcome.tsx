import Title from "./Title";
import Alert from "@/components/ui/alert";
import UserType from "./UserType";
import RegistrationForm from "@/components/RegistrationForm";
import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import { RegistrationsTypeOptions } from "@/pocketbase-types";

function RegistrationTypeFormRenderer({ field, ...props }: FormFieldRendererProps) {
    return <div className="mx-auto w-full overflow-x-auto">
        <div className="flex w-auto gap-x-4">
            <UserType
                {...props}
                id={RegistrationsTypeOptions.student}
                title="Student"
                field={field} />
            <UserType
                {...props}
                id={RegistrationsTypeOptions.professional}
                title="Professional"
                field={field} />
        </div>
    </div>
}

export default function Welcome() {
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

            <RegistrationForm
                noLabel
                group="welcome"
                customComponents={{
                    type: RegistrationTypeFormRenderer
                }} />
        </div>
    );
}
