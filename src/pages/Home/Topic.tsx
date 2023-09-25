import Title from "./Title";
import RegistrationForm from "@/components/RegistrationForm";

export default function Topic() {
    return (
        <div className="w-full flex flex-col items-center space-y-4">
            <Title
                title="Topic Interests"
                description="Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
            />

            <RegistrationForm group="topic" />
        </div>
    );
}
