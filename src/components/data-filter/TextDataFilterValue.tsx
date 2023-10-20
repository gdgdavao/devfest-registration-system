import { Input } from "../ui/input";

export default function TextDataFilterValue({ type, value, onChange }: {
    value: string
    type: string
    onChange: (s: string) => void
}) {
    return (
        <Input
            type={type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(evt) => onChange(evt.currentTarget.value)} />
    );
}
