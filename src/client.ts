import { QueryClient, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import PocketBase, { ClientResponseError, RecordListOptions } from 'pocketbase';
import { Collections, ProfessionalProfilesResponse, RecordIdString, RegistrationStatusesResponse, RegistrationsRecord, RegistrationsResponse as PBRegistrationsResponse, StudentProfilesResponse, RegistrationStatusesStatusOptions, RegistrationsTypeOptions, StudentProfilesRecord, ProfessionalProfilesRecord, AddonsResponse, TicketTypesResponse, FormGroupsResponse, FormGroupsRecord, FormGroupsKeyOptions, MerchSensingDataRecord, PaymentsRecord, PaymentsResponse, AddonOrdersRecord, AddonOrdersResponse } from './pocketbase-types';
import { ErrorOption } from 'react-hook-form';

export const queryClient = new QueryClient();
export const pb = new PocketBase(import.meta.env.VITE_API_URL);

// Server-side error handling
export function handleFormServerSideError(
    err: unknown,
    onError: (errors: Record<string, ErrorOption>) => void
) {
    if (err instanceof ClientResponseError) {
        const errors = getServerSideErrors(err);
        onError(errors);
    }
}

export function getServerSideErrors(err: ClientResponseError) {
    if (err.data.code !== 400) {
        return {};
    }

    let rawErrors = err.data.data;
    if (Object.keys(rawErrors).length === 1 && rawErrors.value && typeof rawErrors.value === 'object') {
        rawErrors = rawErrors.value;
    }

    const errors: Record<string, ErrorOption> = {};
    for (const fieldName in rawErrors) {
        const error = rawErrors[fieldName];
        let errorType: ErrorOption['type'] = 'server';

        switch (error.code) {
        case 'validation_required':
            errorType = 'required';
            break;
        }

        errors[fieldName] = {
            type: errorType,
            message: error.message
        }
    }

    return errors;
}

// Forms
export function useFormGroupQuery(key?: `${FormGroupsKeyOptions}`) {
    return useQuery([Collections.FormGroups, key], () => {
        if (!key) {
            throw new Error('Must provide a key');
        }

        return pb.collection(Collections.FormGroups)
            .getFirstListItem<FormGroupsRecord>(`key="${key}"`);
    }, {
        enabled: typeof key !== 'undefined'
    });
}

export function useFormGroupsQuery() {
    return useQuery([Collections.FormGroups], () => {
        return pb.collection(Collections.FormGroups)
            .getFullList<FormGroupsResponse>({ sort: 'created' });
    });
}

// Registrations
export type RegistrationsResponse = PBRegistrationsResponse<
    Record<string, string>,
    {
        status: RegistrationStatusesResponse,
        student_profile?: StudentProfilesResponse,
        professional_profile?: ProfessionalProfilesResponse,
        payment?: PaymentResponse,
        addons: AddonOrdersResponse,
        ticket: TicketTypesResponse
    }
>

const REGISTRATION_RESP_EXPAND = "status,student_profile,professional_profile,payment,addons,ticket";

export interface RegistrationRecord extends RegistrationsRecord {
    addons_data?: AddonOrdersRecord[]
    student_profile_data?: StudentProfilesRecord
    professional_profile_data?: ProfessionalProfilesRecord
    merch_sensing_data_data?: MerchSensingDataRecord
}

export interface RegistrationField {
    name: string
    type: string
    title: string
    group: string
    description: string
    options: Record<string, unknown>
}

export function useRegistrationMutation() {
    return useMutation((record: RegistrationRecord) => {
        return pb.collection(Collections.Registrations)
            .create<RegistrationsResponse>(record);
    });
}

export function useDeleteRegistrationMutation() {
    return useMutation((id: RecordIdString) => {
        return pb.collection(Collections.Registrations).delete(id);
    });
}

export function useUpdateRegistrationMutation() {
    return useMutation(({id, record}: {id: RecordIdString, record: RegistrationRecord}) => {
        return pb.collection(Collections.Registrations)
            .update<RegistrationsResponse>(id, record);
    });
}

export function useRegistrationsQuery(options?: RecordListOptions) {
    return useInfiniteQuery(
        [Collections.Registrations, JSON.stringify(options)],
        ({ pageParam = 1 }) => {
            return pb.collection(Collections.Registrations)
                .getList<RegistrationsResponse>(pageParam, undefined, {
                    ...options,
                    expand: REGISTRATION_RESP_EXPAND
                });
        },
        {
            getNextPageParam(data) {
                if (data.page + 1 > data.totalPages) return undefined;
                return data.page + 1;
            },
            getPreviousPageParam(data) {
                if (data.page + 1 < 0) return undefined;
                return data.page - 1;
            },
        }
    );
}

export function useRegistrationFieldsQuery(participantType = RegistrationsTypeOptions.student) {
    return useQuery(['registration_fields', participantType], () => {
        return pb.send<RegistrationField[]>(
            `/api/registration_fields?type=${participantType}`,
            { method: 'GET' }
        );
    }, {
        refetchOnWindowFocus: false
    });
}

export function useRegistrationQuery(id: RecordIdString) {
    return useQuery([Collections.Registrations, id], () => {
        return pb.collection(Collections.Registrations).getOne<RegistrationsResponse>(id, {
            expand: REGISTRATION_RESP_EXPAND
        });
    });
}

// Registration Status
export function useUpdateRegistrationStatusMutation() {
    return useMutation(({ id, ...payload }: { id: RecordIdString, status: RegistrationStatusesStatusOptions }) => {
        return pb.collection(Collections.RegistrationStatuses).update(id, payload);
    });
}

// Addons
export function useAddonsQuery() {
    return useQuery([Collections.Addons], () => {
        return pb.collection(Collections.Addons).getFullList<AddonsResponse>();
    });
}

// Ticket Types
export function useTicketTypesQuery() {
    return useQuery([Collections.TicketTypes], () => {
        return pb.collection(Collections.TicketTypes).getFullList<TicketTypesResponse>();
    });
}

export function useTicketTypeQuery(id: string) {
    return useQuery([Collections.TicketTypes, id], () => {
        return pb.collection(Collections.TicketTypes).getOne<TicketTypesResponse>(id);
    }, {
        enabled: typeof id !== "undefined"
    });
}

// Payments
const PAYMENT_RESP_EXPAND = "registrant";

export type PaymentResponse = PaymentsResponse<{ registrant?: RegistrationRecord }>;

export function usePaymentsQuery(options?: RecordListOptions) {
    return useInfiniteQuery(
        [Collections.Payments, JSON.stringify(options)],
        ({ pageParam = 1 }) => {
            return pb.collection(Collections.Payments)
                .getList<PaymentResponse>(pageParam, undefined, {
                    ...options,
                    expand: PAYMENT_RESP_EXPAND
                });
        },
        {
            getNextPageParam(data) {
                if (data.page + 1 > data.totalPages) return undefined;
                return data.page + 1;
            },
            getPreviousPageParam(data) {
                if (data.page + 1 < 0) return undefined;
                return data.page - 1;
            },
        }
    );
}

export function usePaymentQuery(id: RecordIdString) {
    return useQuery([Collections.Payments, id], () => {
        return pb.collection(Collections.Payments).getOne<PaymentsResponse>(id, {
            expand: PAYMENT_RESP_EXPAND
        });
    });
}

export function useUpdatePaymentMutation() {
    return useMutation(({id, record}: {id: RecordIdString, record: Partial<PaymentsRecord>}) => {
        return pb.collection(Collections.Payments)
            .update<PaymentsResponse>(id, record);
    });
}

export interface InitPaymentPayload {
    registrant_id: string
    payment_id: string
    details?: {
        card_number: string
        exp_month: number
        exp_year: number
        cvc: string
        bank_code: string
    },
    billing?: {
        address: string
        line1: string
        line2: string
        city: string
        state: string
        postal_code: string
        country: string
        name: string
        email: string
        phone: string
    }
}

export function useInitiatePaymentMutation() {
    return useMutation((payload: InitPaymentPayload) => {
        return pb.send('/api/payments/initiate', {
            method: 'POST',
            body: payload
        });
    });
}