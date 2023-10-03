import { FormFieldRendererProps } from "../FormFieldRenderer";
import PhoneFormatter from "react-headless-phone-input";
import { Input } from "../ui/input";

export default function PhoneNumberFormRenderer({ value, field, onChange }: FormFieldRendererProps) {
    return (
        <PhoneFormatter defaultCountry="PH" value={value} onChange={onChange}>
            {({ inputValue, onInputChange, onBlur, impossible }) => (<>
                <Input
                    type="tel"
                    value={inputValue}
                    onBlur={onBlur}
                    placeholder={field.options.placeholder as string | undefined}
                    onChange={(e) => onInputChange(e.target.value)} />
                {impossible && <p className="text-destructive">Invalid phone number</p>}
            </>)}
        </PhoneFormatter>
    );
}
