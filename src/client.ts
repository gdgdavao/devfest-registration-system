import { QueryClient, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import PocketBase, { RecordListOptions } from 'pocketbase';
import { BundlesResponse, Collections, ProfessionalProfilesResponse, RecordIdString, RegistrationStatusesResponse, RegistrationsRecord, RegistrationsResponse as PBRegistrationsResponse, StudentProfilesResponse, RegistrationStatusesStatusOptions, RegistrationsTypeOptions } from './pocketbase-types';

export const queryClient = new QueryClient();
export const pb = new PocketBase(import.meta.env.VITE_API_URL);

// Registrations
export type RegistrationsResponse = PBRegistrationsResponse<
    Record<string, string>, 
    { 
        status: RegistrationStatusesResponse,
        student_profile?: StudentProfilesResponse,
        professional_profile?: ProfessionalProfilesResponse,
        payment?: PaymentResponse,
        selected_bundle: BundlesResponse
    }
>

export interface RegistrationField {
    name: string
    type: string
    title: string
    description: string
    options: Record<string, unknown>
}

export function useRegistrationMutation() {
    return useMutation((record: FormData | RegistrationsRecord) => {
        return pb.collection(Collections.Registrations).create<RegistrationsResponse>(record);
    });
}

export function useDeleteRegistrationMutation() {
    return useMutation((id: RecordIdString) => {
        return pb.collection(Collections.Registrations).delete(id);
    });
}

export function useUpdateRegistrationMutation() {
    return useMutation(({id, record}: {id: RecordIdString, record: RegistrationsRecord}) => {
        return pb.collection(Collections.Registrations).update(id, record);
    });
}

export function useRegistrationsQuery(options?: RecordListOptions) {
    return useInfiniteQuery(
        [Collections.Registrations, JSON.stringify(options)], 
        ({ pageParam = 1 }) => {
            return pb.collection(Collections.Registrations)
                .getList<RegistrationsResponse>(pageParam, undefined, {
                    ...options,
                    expand: "status,student_profile,professional_profile,payment,selected_bundle"
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
            expand: "status,student_profile,professional_profile,payment,selected_bundle"
        });
    });
}

// Registration Status
export function useUpdateRegistrationStatusMutation() {
    return useMutation(({ id, ...payload }: { id: RecordIdString, status: RegistrationStatusesStatusOptions }) => {
        return pb.collection(Collections.RegistrationStatuses).update(id, payload);
    });
}

// Bundles
export function useBundlesQuery() {
    return useQuery([Collections.Bundles], () => {
        return pb.collection(Collections.Bundles).getFullList<BundlesResponse>();
    });
}