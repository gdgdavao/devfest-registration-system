import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function SelectDataFilterValue({ values, value, onChange }: {
    values: string[]
    value: string
    onChange: (s: string) => void
}) {
    useEffect(() => {
        if (!value && values.length > 0) {
            onChange(values[0]);
        }
    }, [value, values]);

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder="Values">
                    {value ? value : 'Select...'}
                </SelectValue>
            </SelectTrigger>

            <SelectContent>
                {values.map((value) =>
                    <SelectItem key={`select_${value}`} value={value}>
                        {value}
                    </SelectItem>)}
            </SelectContent>
        </Select>
    );
}
