import { RegistrationField, RegistrationRecord, handleFormServerSideError, useAddonsQuery, useRegistrationFieldsQuery, useTicketTypeQuery } from "@/client";
import {
    AddonOrdersRecord,
    MerchSensingDataMerchSpendingLimitOptions,
    RegistrationsAgeRangeOptions,
    RegistrationsSexOptions,
    RegistrationsTypeOptions,
    RegistrationsYearsTechExpOptions,
    StudentProfilesYearLevelOptions,
} from "@/pocketbase-types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UseFormReturn, useForm, useFormContext } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";

export const RegistrationFormContext = createContext<RegistrationFormContextData>(null!);

interface RegistrationFormContextData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<RegistrationRecord, any, undefined>
    fields: ReturnType<typeof useRegistrationFieldsQuery>
    onFormSubmit: (data: RegistrationRecord) => void
    resetFormToDefault: () => void
}

const defaultValues = {
    sex: RegistrationsSexOptions.male,
    age_range: RegistrationsAgeRangeOptions["below 18"],
    years_tech_exp: RegistrationsYearsTechExpOptions["No Experience"],
    merch_sensing_data_data: {
        merch_spending_limit:
            MerchSensingDataMerchSpendingLimitOptions["₱150-₱250"],
    },
};

export function useSubtotal() {
    const { data: addOns } = useAddonsQuery();
    const form = useFormContext();
    const { data: selectedTicket } = useTicketTypeQuery(form.getValues('ticket'));
    const value = form.getValues('addons_data') as AddonOrdersRecord[];

    const selectedAddons = useMemo(() => {
        if (!addOns || !value) {
            return [];
        }

        return addOns
            .filter(a => value.findIndex(o => o.addon === a.id) !== -1);
    }, [value, addOns]);

    const subtotal = useMemo(() => {
        let total = 0;
        if (selectedTicket) {
            total += selectedTicket.price;
        }

        const totalAddonPrices = selectedAddons
            .reduce((pv, cv) => pv + cv.price, 0) ?? 0;

        total += totalAddonPrices;
        return total;
    }, [selectedTicket, selectedAddons]);

    return {
        selectedTicket,
        selectedAddons,
        subtotal
    }
}

export function buildValidationSchema(fields: RegistrationField[], level = 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSchema: Joi.PartialSchemaMap<any> = {};
    const nestedSchemaToInsert: Record<string, Joi.ObjectSchema> = {};

    for (const field of fields) {
        const keysArray = field.name.split(".");
        if (keysArray.length > 1) {
            const nestedSchema = buildValidationSchema([
                {
                    ...field,
                    name: keysArray.slice(1).join('.')
                }
            ], level + 1);

            if (level > 0) {
                rawSchema[keysArray[0]] = nestedSchema;
            } else {
                nestedSchemaToInsert[keysArray[0]] = nestedSchema;
            }
            continue;
        }

        const messages: Record<string, string> = {
            'string.empty': 'Required',
            'string.email': 'Must be a valid e-mail address',
            'any.required': 'Required',
        };

        if (field.type === "relation") {
            if (field.options.expand) {
                const relSchema = buildValidationSchema(field.options.fields as RegistrationField[]);
                if (field.options.maxSelect === 1) {
                    rawSchema[field.name + "_data"] = relSchema;
                } else {
                    rawSchema[field.name + "_data"] = Joi.array().items(relSchema);
                }
                rawSchema[field.name] = Joi.disallow().messages(messages);
            } else if (field.options.maxSelect === 1) {
                rawSchema[field.name] = Joi.string().messages(messages);
            } else {
                rawSchema[field.name] = Joi.array().items(Joi.string()).messages(messages);
            }
            continue;
        } else if (field.type === "json") {
            rawSchema[field.name] = Joi.any();
            continue;
        }

        if (field.type === "number") {
            const validator = Joi.number();
            rawSchema[field.name] = validator.messages(messages);
            continue;
        }

        let validator = Joi.string();
        if (field.type === "select") {
            const values = field.options.values as string[];
            validator = validator.valid(...values);
            messages['string.valid'] = `Must choose between ${values.slice(0, values.length - 1).join(', ')} and ${values[values.length - 1]}`;
        } else if (field.type === "email") {
            validator = validator.email({ tlds: { allow: false } });
        }

        if (field.options.required) {
            validator = validator.required();
        }

        rawSchema[field.name] = validator.messages(messages);
    }

    for (const parentKey in nestedSchemaToInsert) {
        rawSchema[parentKey] = (rawSchema[parentKey] as Joi.ObjectSchema)
            .concat(nestedSchemaToInsert[parentKey]);
    }

    return Joi.object(rawSchema);
}

export function useSetupRegistrationForm({ rename = {addons: 'addons_data'}, extraFields = [], onSubmit }: {
    rename?: Record<string, string>;
    extraFields?: RegistrationField[];
    onSubmit?: (
        record: RegistrationRecord,
        onError: (err: unknown) => void
    ) => void;
}): RegistrationFormContextData {
    const [validationSchema, setValidationSchema] = useState(Joi.object());
    const form = useForm<RegistrationRecord>({
        resolver: joiResolver(validationSchema, {
            stripUnknown: true,
            abortEarly: false
        }),
        mode: 'onBlur',
        defaultValues
    });
    const watchRegType = form.watch("type");
    const fieldsQuery = useRegistrationFieldsQuery({ participantType: watchRegType, rename, extraFields });
    const resetFormToDefault = () => form.reset(defaultValues);
    const onFormSubmit = (data: RegistrationRecord) =>
        onSubmit?.(data, (err) =>
            handleFormServerSideError(err, (errors) => {
                for (const fieldName in errors) {
                    form.setError(fieldName as never, errors[fieldName]);
                }
            })
        );

    const loadForm = () => {
        if (watchRegType === RegistrationsTypeOptions.student) {
            form.setValue("professional_profile_data", undefined);

            if (
                !form.getValues("student_profile_data") ||
                Object.keys(form.getValues("student_profile_data")!).length === 0
            ) {
                form.setValue("student_profile_data", {
                    designation: "",
                    school: "",
                    year_level: StudentProfilesYearLevelOptions["1st Year"],
                });
            }
        } else {
            form.setValue("student_profile_data", undefined);
        }
    }

    useEffect(loadForm, []);
    useEffect(loadForm, [watchRegType, fieldsQuery.refetch]);

    useEffect(() => {
        if (fieldsQuery.data) {
            setValidationSchema(buildValidationSchema(fieldsQuery.data));
        }
    }, [fieldsQuery.data]);

    return {
        form,
        fields: fieldsQuery,
        onFormSubmit,
        resetFormToDefault
    }
}

export function useRegistrationForm() {
    return useContext(RegistrationFormContext);
}
