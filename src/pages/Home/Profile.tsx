import RegistrationSection from "@/components/layouts/RegistrationSection";
import RegistrationForm from "@/components/RegistrationForm";

export default function Profile() {
    return (
        <RegistrationSection id="profile">
            <RegistrationForm group="profile" />
        </RegistrationSection>
    );
}
