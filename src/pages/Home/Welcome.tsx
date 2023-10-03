import Alert from "@/components/ui/alert";
import UserType from "./UserType";
import RegistrationForm from "@/components/RegistrationForm";
import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import { RegistrationsTypeOptions } from "@/pocketbase-types";

import StudentIconImg from "@/assets/student_icon.png";
import ProIconImg from "@/assets/prof_icon.png";
import RegistrationSection from "@/components/layouts/RegistrationSection";
import { useFormGroupQuery } from "@/client";

function RegistrationTypeFormRenderer({ field, ...props }: FormFieldRendererProps) {
    const { data } = useFormGroupQuery<{
        student_title: string
        student_description: string
        professional_title: string
        professional_description: string
    }>("welcome");

    return <div className="flex w-auto gap-x-4 py-4">
        <UserType
            {...props}
            className="w-1/2"
            image={StudentIconImg}
            id={RegistrationsTypeOptions.student}
            title={data?.custom_content?.student_title}
            description={data?.custom_content?.student_description}
            field={field} />

        <UserType
            {...props}
            className="w-1/2"
            image={ProIconImg}
            id={RegistrationsTypeOptions.professional}
            title={data?.custom_content?.professional_title}
            description={data?.custom_content?.professional_description}
            field={field} />
    </div>
}

export default function Welcome() {
    return (
        <RegistrationSection id="welcome">
            <Alert
                icon="Info"
                className="text-left"
                variant="info"
                description="Registering for GDG Davao DevFest 2023 doesn't guarantee you a spot. We'll review all registrations to ensure that everyone has an equal chance to attend."
            />

            <RegistrationForm
                noLabel
                group="welcome"
                customComponents={{
                    type: RegistrationTypeFormRenderer
                }} />
        </RegistrationSection>
    );
}
