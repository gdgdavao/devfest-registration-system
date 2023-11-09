import SelectDataFilterValue from "./SelectDataFilterValue";

export default function BooleanSelectDataFilterValue({ value, onChange }: {
    value: string
    onChange: (s: boolean) => void
}) {
    return <SelectDataFilterValue
        value={value ? "true" : "false"}
        onChange={(v) => onChange(v === "true")}
        values={["true", "false"]} />;
}
