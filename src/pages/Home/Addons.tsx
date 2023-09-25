import RichAddonsFormRenderer from "@/components/form_renderers/RichAddonsFormRenderer";
import Title from "./Title";
import RegistrationForm from "@/components/RegistrationForm";
import RichTicketFormRenderer from "@/components/form_renderers/RichTicketsFormRenderer";

export default function Addons() {
    return (
        <div className="w-full flex flex-col items-center space-y-4">
            <Title
                title="Add-ons"
                description="Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
            />

            <RegistrationForm
                group="addOn"
                customComponents={{
                    ticket: RichTicketFormRenderer,
                    addons: RichAddonsFormRenderer
                }} />
        </div>
    );
}
