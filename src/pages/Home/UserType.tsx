import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import parseHtml, { Element, domToReact } from "html-react-parser";
import React, { useState } from "react";

export interface userType {
    title?: string;
    description?: string;
}

const UserType: React.FC<userType> = ({ title, description }) => {
    const [selectedType, setSelectedType] = useState("");
    return (
        <Card
            className={cn(
                "flex flex-col items-center justify-between p-4 space-y-4 text-center min-w-[250px]",
                selectedType && "outline outline-2 outline-primary"
            )}
            onClick={() => setSelectedType(userType.id)}
        >
            <CardHeader>
                <CardTitle className="flex flex-col items-center space-y-4">
                    <div className="w-40 h-40 bg-secondary" />
                    <h4>I am a {title || "Student"}.</h4>
                </CardTitle>

                <CardDescription className="text-sm">
                    {parseHtml(
                        description ||
                            "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis."
                    )}
                </CardDescription>
            </CardHeader>

            <CardFooter className="w-full flex justify-center">
                <Button className="w-[70%] max-w-md">Select</Button>
            </CardFooter>
        </Card>
    );
};

export default UserType;
