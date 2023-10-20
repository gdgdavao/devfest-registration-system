import SelectDataFilterValue from "./SelectDataFilterValue";

export default function BooleanSelectDataFilterValue({ value, onChange }: {
    value: string
    onChange: (s: string) => void
}) {
    return <SelectDataFilterValue
        value={value}
        onChange={onChange}
        values={["true", "false"]} />;
}
