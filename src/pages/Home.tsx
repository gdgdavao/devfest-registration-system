import { pb } from "@/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, FC, createContext, useContext, useEffect, useRef, useState } from "react";

interface FormContextData {
    set: (key: string, value: string) => void,
    get: (key: string) => string | null,
}

const FormContext = createContext<FormContextData>(null!);
const useForm = () => useContext(FormContext);

interface RegistrationField {
    name: string
    type: string
    title: string
    description: string
    options: Record<string, unknown>
}

// TODO: make payments required!

function TopicInterestFormRenderer({ name, field }: { name: string, field: RegistrationField }) {
    const form = useForm();
    const topics = (field.options.topics as { key: string, name: string }[]);
    const values = field.options.values as string[];
    const [selected, setSelected] = useState(
        topics.map(t => ({ [t.key]: values[0] })).reduce((pv, cv) => {
            return { ...pv, ...cv };
        }, {})
    );

    useEffect(() => {
        form.set(name, JSON.stringify(selected));
    }, [name, selected, form]);

    return (
        <div>
            <div className="flex flex-col">
                {topics.map(topic => (
                    <div key={`topic_${topic.key}`} className="flex flex-row">
                        <div className="w-1/2">
                            {topic.name}
                        </div>

                        <div className="w-1/2 flex flex-row">
                        {values.map((v, i) => (
                            <div key={`topic_${topic.key}_choice_${i}`}>
                                <Button
                                    type="button"
                                    onClick={() => setSelected(s => ({ ...s, [topic.key]: v }))}
                                    variant={selected[topic.key] === v ? 'destructive' : 'default'}
                                    className="py-8">{v}</Button>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function FormRenderer({ field, customComponents }: {
    field: RegistrationField,
    customComponents?: Record<string, FC<{ name: string, field: RegistrationField }>>
}) {
    const name = field.name;
    const form = useForm();
    const defaultChangeHandler = (ev: ChangeEvent<HTMLInputElement>) => { form.set(name, ev.currentTarget.value) };

    if (customComponents && customComponents[name]) {
        const CustomFormRenderer = customComponents[name];
        return <CustomFormRenderer name={name} field={field} />
    }

    if (field.type === "select") {
        const values = field.options.values as string[];
        return <Select onValueChange={(value) => { form.set(name, value); }}>
            <SelectTrigger>
                <SelectValue placeholder={values[0] ?? ''} />
            </SelectTrigger>
            <SelectContent>
                {values.map(v => (
                    <SelectItem
                        key={`registration_${name}_select_${v}`}
                        value={v}>{v}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    }

    if (field.type === "relation") {
        if (field.options.fields) {
            return <FormContext.Provider value={{
                set(key: string, value: string) {
                    let payload: Record<string, unknown> = {};
                    const rawPayload = form.get(name + '_data');
                    if (rawPayload) {
                        payload = JSON.parse(rawPayload);
                        if (typeof payload !== "object") {
                            payload = {};
                        }
                    }

                    payload![key] = value;
                    form.set(name + '_data', JSON.stringify(payload));
                },
                get(key: string) {
                    let payload: Record<string, unknown> = {};
                    const rawPayload = form.get(name + '_data');
                    if (rawPayload) {
                        payload = JSON.parse(rawPayload);
                        if (typeof payload !== "object") {
                            payload = {};
                        }
                    }
                    return `${payload[key]}`;
                }
            }}>
                <div className="flex flex-col">
                    {(field.options.fields as RegistrationField[]).map(sfield => (
                        <div key={`registration_${field.name}_${sfield.name}`} className="py-4">
                            <Label htmlFor={sfield.name}>{sfield.title}</Label>
                            <FormRenderer
                                field={sfield}
                                customComponents={customComponents} />
                        </div>
                    ))}
                </div>
            </FormContext.Provider>
        }

        return <Input
            onChange={defaultChangeHandler}
            type="text" id={name} />
    }

    if (field.type === "email") {
        return <Input
            onChange={defaultChangeHandler}
            type="email" id={name} />
    }

    if (field.type === "bool") {
        return <div className="flex items-center space-x-2">
            <Checkbox
                onCheckedChange={(checked) => { form.set(name, typeof checked === "string" ? checked : `${checked}`) }}
                id={name} />
            <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {(field.options.checkbox_label as string) ?? name}
            </label>
        </div>
    }

    return <Input
        onChange={defaultChangeHandler}
        type="text" id={name} />
}

export default function Home() {
    const [formData, setFormData] = useState(new FormData());
    const [participantType, setParticipantType] = useState('student');
    const formElRef = useRef<HTMLFormElement>(null);
    const { data, refetch: refetchFields } = useQuery(['field'], () => {
        return pb.send<RegistrationField[]>(
            `/api/registration_fields?type=${participantType}`,
            { method: 'GET' }
        );
    }, {
        refetchOnWindowFocus: false
    });

    const { mutate: submitForm } = useMutation(async (fd: FormData) => {
        return pb.collection('registrations').create(fd);
    });

    useEffect(() => {
        refetchFields();
    }, [participantType, refetchFields]);

    return (
        // TODO: use Form component
        <form
            ref={formElRef}
            onSubmit={(ev) => {
                ev.preventDefault();
                const fdFromForm = new FormData(ev.currentTarget);

                formData.forEach((v, k) => {
                    fdFromForm.set(k, v);
                });

                submitForm(fdFromForm);
            }}
            className="max-w-3xl px-3 mx-auto flex flex-col space-y-2">
            <FormContext.Provider value={{
                set(key: string, value: string) {
                    if (key === 'type') {
                        setParticipantType(value);
                    }

                    setFormData(formData => {
                        formData.set(key, value);
                        return formData;
                    })
                },
                get(key: string) {
                    const val = formData.get(key);
                    if (!val) return null;
                    return val.toString();
                }
            }}>
                {data?.map(field => (
                    <div key={`registration_${field.name}`} className="py-4">
                        <Label htmlFor={field.name}>{field.title}</Label>
                        <FormRenderer
                            field={field}
                            customComponents={{
                                "topic_interests": TopicInterestFormRenderer
                            }} />
                    </div>
                ))}
            </FormContext.Provider>

            <Button type="submit">Submit</Button>
        </form>
    );
}
