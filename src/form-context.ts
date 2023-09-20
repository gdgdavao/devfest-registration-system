import { createContext, useContext } from "react";


export interface FormContextData {
    set: (key: string, value: string) => void,
    get: (key: string) => string | null,
}

export const FormContext = createContext<FormContextData>(null!);
export const useFormContext = () => useContext(FormContext);