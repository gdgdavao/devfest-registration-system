import { useRegistrationMutation } from "@/client";

import RegistrationForm from "@/components/RegistrationForm";
import RichAddonsFormRenderer from "@/components/form_renderers/RichAddonsFormRenderer";

// TODO: make payments required!
export default function Home() {
    const { mutate: submitForm } = useRegistrationMutation();

    return (
        <RegistrationForm
            onSubmit={(record, onError) => {
                submitForm(record, { onError });
            }}
            customComponents={{
                "addons": RichAddonsFormRenderer
            }} />
    );
}
