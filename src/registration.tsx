import { useRegistrationFieldsQuery } from "@/client";
import { RegistrationsTypeOptions } from "@/pocketbase-types";
import { ReactNode, useState } from "react";
import { FormContext } from "@/form-context";

export function useRegistrationForm() {
    const [formData, setFormData] = useState(new FormData());
    const [registrationType, setRegistrationType] = useState(RegistrationsTypeOptions.student);
    const fieldsQuery = useRegistrationFieldsQuery(registrationType);
    const FormProvider = ({ children }: { children: ReactNode }) => {
        return <FormContext.Provider value={{
            set(key: string, value: string) {
                if (key === 'type') {
                    setRegistrationType((pt) => {
                        if (value === 'student') {
                            return RegistrationsTypeOptions.student;
                        } else if (value === 'professional') {
                            return RegistrationsTypeOptions.professional;
                        }
                        return pt;
                    });
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
            {children}
        </FormContext.Provider>
    }

    return {
        registrationType,
        setRegistrationType,
        formData,
        setFormData,
        FormProvider,
        fieldsQuery
    }
}