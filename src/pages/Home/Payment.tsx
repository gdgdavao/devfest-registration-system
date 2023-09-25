import RegistrationSection from "@/components/layouts/RegistrationSection";
import RegistrationForm from "@/components/RegistrationForm";

export default function Payment() {
    return (
        <RegistrationSection id="payment">
            <RegistrationForm group="payment" />
        </RegistrationSection>
    );
}
