import { pb } from "@/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, createContext, useContext, useEffect, useRef, useState } from "react";

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

function FormRenderer({ parentField, field, customComponents }: {
    parentField?: string,
    field: RegistrationField,
    customComponents?: Record<string, FC<{ name: string, field: RegistrationField }>>
}) {
    const name = parentField ? `${parentField}.${field.name}` : field.name;
    const form = useForm();

    if (field.type === "select") {
        const values = field.options.values as string[];
        return <Select onValueChange={(value) => {
            form.set(name, value);
        }} name={name}>
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
            return <div className="flex flex-col">
                {(field.options.fields as RegistrationField[]).map(sfield => (
                    <div key={`registration_${field.name}_${sfield.name}`} className="py-4">
                        <Label htmlFor={sfield.name}>{sfield.title}</Label>
                        <FormRenderer
                            field={sfield}
                            parentField={name}
                            customComponents={customComponents} />
                    </div>
                ))}
            </div>
        }

        return <Input type="text" name={name} id={name} />
    }

    if (customComponents && customComponents[name]) {
        const CustomFormRenderer = customComponents[name];
        return <CustomFormRenderer name={name} field={field} />
    }

    if (field.type === "email") {
        return <Input type="email" name={name} id={name} />
    }

    return <Input type="text" name={name} id={name} />
}

export default function Home() {
    const [formData, setFormData] = useState(new FormData());
    const formElRef = useRef<HTMLFormElement>(null);
    const { data } = useQuery(['field'], () => {
        return pb.send<RegistrationField[]>('/api/registration_fields', {
            method: 'GET'
        });
    });

    const { mutate: submitForm } = useMutation((fd: FormData) => {
        // TODO: create relation ids on demand
        // const relationFields = data?.filter(f => f.type === "relation").map(f => `${f.name}.`) ?? [];
        // const relationValues: Record<string, string> = {}

        // // fd.forEach((v, k) => {
        // //     if (relationFields.some(f => k.startsWith(f))) {
        // //         relationValues[]
        // //     }
        // // });

        const record = pb.collection('registrations').create(fd);
        return record;
    });

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
