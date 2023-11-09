import { useDebouncedCallback } from "use-debounce";
import { Input } from "../ui/input";

export default function TextDataFilterValue({ type, value, onChange }: {
    value: string
    type: string
    onChange: (s: string) => void
}) {
    const debouncedOnChange = useDebouncedCallback(onChange, 1000);

    return (
        <Input
            type={type === 'number' ? 'number' : 'text'}
            defaultValue={value}
            onChange={(evt) => debouncedOnChange(evt.currentTarget.value)} />
    );
}
