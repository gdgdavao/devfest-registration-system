import RichAddonsFormRenderer from "@/components/form_renderers/RichAddonsFormRenderer";
import RegistrationForm from "@/components/RegistrationForm";
import RichTicketFormRenderer from "@/components/form_renderers/RichTicketsFormRenderer";
import RegistrationSection from "@/components/layouts/RegistrationSection";

export default function Addons() {
    return (
        <RegistrationSection id="addOn">
            <RegistrationForm
                group="addOn"
                customComponents={{
                    ticket: RichTicketFormRenderer,
                    addons: RichAddonsFormRenderer
                }} />
        </RegistrationSection>
    );
}
