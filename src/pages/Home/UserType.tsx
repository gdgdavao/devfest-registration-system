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
    image?: string;
    title?: string;
    description?: string;
    className?: string;
}

export default function UserType({ id, image, title, description, value, className, onChange }: UserTypeProps & FormFieldRendererProps) {
    return (
        <Card className={cn(className, value === id && 'outline outline-2 outline-yellow-500', 'flex flex-col justify-between')}>
            <CardHeader className="flex flex-row md:flex-col items-center text-center">
                {image ? (
                    <div className="max-h-64 w-1/3 md:w-full mb-4">
                        <img src={image} alt={title || "Student"} className="w-full h-auto" />
                    </div>
                ) : <div className="w-40 h-40 bg-secondary mb-4" />}

                <div className="pl-4 md:pl-0 w-2/3 md:w-full flex flex-col text-left md:items-center md:text-center">
                    <CardTitle>{title}</CardTitle>

                    {parseHtml(
                        description ||
                            "<p>Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.</p>", {
                                replace: (domNode) => {
                                    if (domNode instanceof Element && domNode.attribs) {
                                        return <CardDescription className="text-sm">
                                            {domToReact(domNode.children)}
                                        </CardDescription>;
                                    }
                                }
                            })}
                </div>
            </CardHeader>

            <CardFooter className="w-full flex justify-end md:justify-center">
                <Button
                    variant={value === id ? 'secondary' : 'default'}
                    onClick={() => onChange(id)}
                    className="w-[50%] md:w-[70%] max-w-md">{value === id ? 'Selected' : 'Select'}</Button>
            </CardFooter>
        </Card>
    );
}
