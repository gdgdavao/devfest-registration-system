import { RegistrationRecord, useRegistrationFieldsQuery } from "@/client";
import {
    MerchSensingDataMerchSpendingLimitOptions,
    RegistrationsAgeRangeOptions,
    RegistrationsSexOptions,
    RegistrationsTypeOptions,
    RegistrationsYearsTechExpOptions,
    StudentProfilesYearLevelOptions,
} from "@/pocketbase-types";
import { createContext, useContext, useEffect } from "react";
import { UseFormReturn, useForm } from "react-hook-form";

export const RegistrationFormContext = createContext<RegistrationFormContextData>(null!);

interface RegistrationFormContextData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<RegistrationRecord, any, undefined>
    fields: ReturnType<typeof useRegistrationFieldsQuery>
    resetFormToDefault: () => void
}

const defaultValues = {
    type: RegistrationsTypeOptions.student,
    sex: RegistrationsSexOptions.male,
    age_range: RegistrationsAgeRangeOptions["below 18"],
    years_tech_exp: RegistrationsYearsTechExpOptions["No Experience"],
    merch_sensing_data_data: {
        merch_spending_limit:
            MerchSensingDataMerchSpendingLimitOptions["₱150-₱250"],
    },
};

export function useSetupRegistrationForm(): RegistrationFormContextData {
    const form = useForm<RegistrationRecord>({ defaultValues });
    const watchRegType = form.watch("type");
    const fieldsQuery = useRegistrationFieldsQuery(watchRegType);
    const resetFormToDefault = () => form.reset(defaultValues);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        if (watchRegType === RegistrationsTypeOptions.student) {
            form.setValue("professional_profile_data", undefined);

            if (
                !form.getValues("student_profile_data") ||
                Object.keys(form.getValues("student_profile_data")!).length ===
                    0
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

        fieldsQuery.refetch();
    }, [watchRegType, fieldsQuery.refetch]);

    return {
        form,
        fields: fieldsQuery,
        resetFormToDefault
    }
}

export function useRegistrationForm() {
    return useContext(RegistrationFormContext);
}
