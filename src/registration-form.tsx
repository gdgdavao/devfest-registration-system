import { RegistrationRecord, useRegistrationFieldsQuery } from "@/client";
import { RegistrationsAgeRangeOptions, RegistrationsSexOptions, RegistrationsTypeOptions, RegistrationsYearsTechExpOptions } from "@/pocketbase-types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export function useRegistrationForm() {
    const form = useForm<RegistrationRecord>({
        defaultValues: {
            type: RegistrationsTypeOptions.student,
            sex: RegistrationsSexOptions.male,
            age_range: RegistrationsAgeRangeOptions["below 18"],
            years_tech_exp: RegistrationsYearsTechExpOptions["No Experience"]
        }
    });

    const watchRegType = form.watch("type");
    const fieldsQuery = useRegistrationFieldsQuery(watchRegType);

    useEffect(() => {
        if (watchRegType === RegistrationsTypeOptions.student) {
            form.setValue('professional_profile_data', undefined)
        } else {
            form.setValue('student_profile_data', undefined);
        }

        fieldsQuery.refetch();
    }, [watchRegType, fieldsQuery.refetch]);

    return {
        form,
        fieldsQuery
    }
}