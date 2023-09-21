import { useRegistrationMutation } from "@/client";

import RegistrationForm from "@/components/RegistrationForm";
import RichBundleFormRenderer from "@/components/form_renderers/RichBundleFormRenderer";

// TODO: make payments required!
export default function Home() {
    const { mutate: submitForm } = useRegistrationMutation();

    return (
        <RegistrationForm 
            onSubmit={(record, onError) => {
                submitForm(record, { onError });
            }}
            customComponents={{
                "selected_bundle": RichBundleFormRenderer
            }} />
    );
}
