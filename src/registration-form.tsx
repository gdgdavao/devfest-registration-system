import { RegistrationRecord, useRegistrationFieldsQuery } from "@/client";
import {
    MerchSensingDataMerchSpendingLimitOptions,
    RegistrationsAgeRangeOptions,
    RegistrationsSexOptions,
    RegistrationsTypeOptions,
    RegistrationsYearsTechExpOptions,
    StudentProfilesYearLevelOptions,
} from "@/pocketbase-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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

export function useRegistrationForm() {
    const form = useForm<RegistrationRecord>({ defaultValues });
    const watchRegType = form.watch("type");
    const fieldsQuery = useRegistrationFieldsQuery(watchRegType);
    const resetFormToDefault = () => form.reset(defaultValues);

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
        resetFormToDefault,
        fieldsQuery,
    };
}
