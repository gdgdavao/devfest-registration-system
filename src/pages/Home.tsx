import { pb } from "@/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { useQuery } from "@tanstack/react-query";

interface RegistrationField {
    name: string
    type: string
    options: Record<string, any>
}

function FormRenderer({ field }: { field: RegistrationField }) {
    if (field.type === "text" || field.type === "email") {
        return <Input type="text" name={field.name} id={field.name} />
    }

    if (field.type === "select") {
        return <Select>
            <SelectTrigger>
                <SelectValue placeholder="test" />
            </SelectTrigger>
            <SelectContent>
                {(field.options.values as string[]).map(v => (
                    <SelectItem value={v}>{v}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    }

    if (field.type === "json") {
        if (field.name === "topic_interests") {
            return (
                <div>
                    <div className="flex">

                    </div>
                </div>
            )
        }
    }

    return <div></div>
}

export default function() {
    const { data } = useQuery(['field'], () => {
        return pb.send<RegistrationField[]>('/api/registration_fields', {
            method: 'GET'
        });
    });
    
    return (
        <div className="max-w-3xl px-3 mx-auto flex flex-col space-y-2">
            {data?.map(field => (
                <div key={`registration_${field.name}`} className="py-4">
                    <Label htmlFor={field.name}>{field.name}</Label>
                    <FormRenderer field={field} />
                </div>
            ))}
        </div>
    );
}