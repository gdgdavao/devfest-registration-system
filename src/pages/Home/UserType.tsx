import { FormFieldRendererProps } from "@/components/FormFieldRenderer";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RegistrationsTypeOptions } from "@/pocketbase-types";
import parseHtml from "html-react-parser";

export interface UserTypeProps {
    id: RegistrationsTypeOptions;
    title?: string;
    description?: string;
}

export default function UserType({ id, title, description, value, onChange }: UserTypeProps & FormFieldRendererProps) {
    return (
        <Card className={cn(value === id && 'outline outline-2 outline-primary', 'flex flex-col justify-between')}>
            <CardHeader>
                <CardTitle className="flex flex-col items-center space-y-4 text-center">
                    <div className="w-40 h-40 bg-secondary" />
                    <h4>I am a {title || "Student"}.</h4>
                </CardTitle>

                <CardDescription className="text-sm text-center">
                    {parseHtml(
                        description ||
                            "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
                    )}
                </CardDescription>
            </CardHeader>

            <CardFooter className="w-full flex justify-center">
                <Button
                    variant={value === id ? 'secondary' : 'default'}
                    onClick={() => onChange(id)}
                    className="w-[70%] max-w-md">{value === id ? 'Selected' : 'Select'}</Button>
            </CardFooter>
        </Card>
    );
}
