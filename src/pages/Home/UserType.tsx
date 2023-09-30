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
import parseHtml, { domToReact, Element } from "html-react-parser";

export interface UserTypeProps {
    id: RegistrationsTypeOptions;
    title?: string;
    description?: string;
    className?: string;
}

export default function UserType({ id, title, description, value, className, onChange }: UserTypeProps & FormFieldRendererProps) {
    return (
        <Card className={cn(className, value === id && 'outline outline-2 outline-primary', 'flex flex-col justify-between')}>
            <CardHeader className="flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-secondary mb-4" />

                <CardTitle>
                    I am a {title || "Student"}.
                </CardTitle>

                {parseHtml(
                    description ||
                        "<p>Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</p>", {
                            replace: (domNode) => {
                                if (domNode instanceof Element && domNode.attribs) {
                                    return <CardDescription className="text-sm text-center">
                                        {domToReact(domNode.children)}
                                    </CardDescription>;
                                }
                            }
                        })}
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
