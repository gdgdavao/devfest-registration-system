import { useFormGroupQuery } from "@/client";
import RegistrationSection from "@/components/layouts/RegistrationSection";
import DoneIcon from "@/assets/done_icon.png";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Done() {
    const location = useLocation();
    const { data } = useFormGroupQuery<{hero_title: string, hero_subtitle: string}>("done");

    if (!location.state || !location.state.from || location.state.from !== 'payments-done') {
        return <Navigate to="/" replace />;
    }

    return (
        <RegistrationSection>
            <div className="max-w-2xl mx-auto flex flex-col text-center items-center mb-24">
                <img src={DoneIcon} alt="Done" className="max-w-[20rem] h-full mb-8" />

                <h1 className="font-bold mb-4">{data?.custom_content?.hero_title ?? 'Thanks for registering!'}</h1>
                <p className="font-mono text-gray-500 mb-8">{data?.custom_content?.hero_subtitle ?? `You'll be notified via e-mail.`}</p>

                <Button size="lg" asChild>
                    <Link to="/">Submit another registration</Link>
                </Button>
            </div>
        </RegistrationSection>
    );
}
