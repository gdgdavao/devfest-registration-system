import { useFormGroupQuery } from "@/client";
import RegistrationSection from "@/components/layouts/RegistrationSection";
import DoneIcon from "@/assets/done_icon.png";

export default function Done() {
    const { data } = useFormGroupQuery<{hero_title: string, hero_subtitle: string}>("done");

    return (
        <RegistrationSection>
            <div className="max-w-2xl mx-auto flex flex-col text-center items-center">
                <img src={DoneIcon} alt="Done" className="max-w-[20rem] h-full mb-8" />

                <h1 className="font-bold mb-4">{data?.custom_content?.hero_title ?? 'Thanks for registering!'}</h1>
                <p className="font-mono text-gray-500">{data?.custom_content?.hero_subtitle ?? `You'll be notified via e-mail.`}</p>
            </div>
        </RegistrationSection>
    );
}
