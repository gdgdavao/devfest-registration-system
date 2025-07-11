import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import PocketBase, { ClientResponseError, RecordListOptions } from "pocketbase";
import {
  Collections,
  ProfessionalProfilesResponse,
  RecordIdString,
  RegistrationStatusesResponse,
  RegistrationsRecord,
  RegistrationsResponse as PBRegistrationsResponse,
  StudentProfilesResponse,
  RegistrationStatusesStatusOptions,
  RegistrationsTypeOptions,
  StudentProfilesRecord,
  ProfessionalProfilesRecord,
  AddonsResponse,
  TicketTypesResponse,
  FormGroupsResponse,
  FormGroupsRecord,
  FormGroupsKeyOptions,
  MerchSensingDataRecord,
  PaymentsResponse,
  AddonOrdersRecord,
  AddonOrdersResponse,
  TopicInterestsResponse,
  ManualPaymentsResponse,
  ManualPaymentsRecord,
  AddonsRecord,
  MerchSensingDataResponse,
  CustomSettingsResponse,
  RegistrationStatusesReasonOptions,
  ParticipantsResponse,
  ParticipantsRecord,
} from "./pocketbase-types";
import { ErrorOption } from "react-hook-form";
import {
  CreatePaymentMethod,
  InitPaymentResult,
  PaymentIntent,
  PaymentMethod,
} from "./payment-types";
import jsonToFormData from "json-form-data";
import * as pbf from "@nedpals/pbf";
import { toast } from "react-hot-toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
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
  if (
    Object.keys(rawErrors).length === 1 &&
    rawErrors.value &&
    typeof rawErrors.value === "object"
  ) {
    rawErrors = rawErrors.value;
  }

  const errors: Record<string, ErrorOption> = {};
  for (const fieldName in rawErrors) {
    const error = rawErrors[fieldName];
    let errorType: ErrorOption["type"] = "server";

    switch (error.code) {
      case "validation_required":
        errorType = "required";
        break;
    }

    errors[fieldName] = {
      type: errorType,
      message: error.message,
    };
  }

  return errors;
}

// Topic Interests
export function useTopicInterestsQuery() {
  return useQuery([Collections.TopicInterests], () => {
    return pb
      .collection(Collections.TopicInterests)
      .getFullList<TopicInterestsResponse>({ sort: '-updated' });
  }, {
    staleTime: 10 * (60 * 1000),
  });
}

// Forms
export function useFormGroupQuery<T = unknown>(
  key?: `${FormGroupsKeyOptions}`
) {
  return useQuery(
    [Collections.FormGroups, key],
    () => {
      if (!key) {
        throw new Error("Must provide a key");
      }

      return pb
        .collection(Collections.FormGroups)
        .getFirstListItem<FormGroupsRecord<T>>(`key="${key}"`);
    },
    {
      enabled: typeof key !== "undefined",
    }
  );
}

export function useFormGroupsQuery() {
  return useQuery([Collections.FormGroups], () => {
    return pb
      .collection(Collections.FormGroups)
      .getFullList<FormGroupsResponse>({ sort: "created" });
  });
}

// Registrations
export type RegistrationsResponse = PBRegistrationsResponse<
  Record<string, string>,
  {
    status: RegistrationStatusesResponse;
    student_profile?: StudentProfilesResponse;
    professional_profile?: ProfessionalProfilesResponse;
    // payment?: PaymentResponse,
    payment?: ManualPaymentsResponse<{
      transaction_id: string;
      mobile_number: string;
    }>;
    addons: AddonOrdersResponse<unknown, { addon: AddonsRecord }>[];
    ticket: TicketTypesResponse;
    merch_sensing_data: MerchSensingDataResponse;
  }
>;

export const REGISTRATION_RESP_EXPAND =
  "status,student_profile,professional_profile,payment,addons.addon,ticket,merch_sensing_data";

export interface RegistrationRecord extends RegistrationsRecord {
  addons_data?: AddonOrdersRecord[];
  payment_data?: ManualPaymentsRecord;
  student_profile_data?: StudentProfilesRecord;
  professional_profile_data?: ProfessionalProfilesRecord;
  merch_sensing_data_data?: MerchSensingDataRecord;
}

export interface RegistrationField {
  name: string;
  type: string;
  title: string;
  group: string;
  description: string;
  options: Record<string, unknown>;
}

export const mutationConfig = {
  onError(error: unknown) {
    if (error instanceof ClientResponseError) {
      toast.error(error.message);
    }
  },
}

export function useRegistrationMutation() {
  return useMutation(async (record: RegistrationRecord) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entryData: Record<string, any> = {
      ...record,
      payment_data: null,
      topic_interests: JSON.stringify(record.topic_interests),
      addons_data: JSON.stringify(record.addons_data ?? []),
      merch_sensing_data_data: JSON.stringify(record.merch_sensing_data_data),
      student_profile_data: record.student_profile_data
        ? JSON.stringify(record.student_profile_data)
        : undefined,
      professional_profile_data: record.professional_profile_data
        ? JSON.stringify(record.professional_profile_data)
        : undefined,
    };

    const gotRecord = await pb
      .collection(Collections.Registrations)
      .create<RegistrationsResponse>(entryData);
    const paymentRecord = await pb
      .collection(Collections.ManualPayments)
      .create<ManualPaymentsResponse>(
        jsonToFormData({
          registrant: gotRecord.id,
          receipt: record.payment_data?.receipt,
          expected_amount: record.payment_data?.expected_amount,
          transaction_details: JSON.stringify(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            record.payment_data?.transaction_details as any
          ),
        })
      );

    const extra: Record<string, string> = {};
    if (record.student_profile_data) {
      const profileRecord = await pb
        .collection(Collections.StudentProfiles)
        .create<StudentProfilesResponse>(
          jsonToFormData({
            registrant: gotRecord.id,
            ...record.student_profile_data,
          })
        );

      extra["student_profile"] = profileRecord.id;
    } else if (record.professional_profile_data) {
      const profileRecord = await pb
        .collection(Collections.ProfessionalProfiles)
        .create<ProfessionalProfilesResponse>(
          jsonToFormData({
            registrant: gotRecord.id,
            ...record.professional_profile_data,
          })
        );

      extra["professional_profile"] = profileRecord.id;
    }

    return await pb
      .collection(Collections.Registrations)
      .update<RegistrationsResponse>(gotRecord.id, {
        payment: paymentRecord.id,
        ...extra,
      });
  }, mutationConfig);
}

export function useMerchSensingDataQuery(options?: RecordListOptions) {
  return useInfiniteQuery(
    [Collections.MerchSensingData, JSON.stringify(options)],
    ({ pageParam = 1 }) => {
      return pb
        .collection(Collections.MerchSensingData)
        .getList<
          MerchSensingDataResponse<
            string[],
            { registrant: PBRegistrationsResponse }
          >
        >(pageParam, undefined, {
          ...options,
          expand: "registrant",
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

export function useDeleteRegistrationMutation() {
  return useMutation((id: RecordIdString) => {
    return pb.collection(Collections.Registrations).delete(id);
  }, mutationConfig);
}

export function useUpdateRegistrationMutation() {
  return useMutation(
    ({ id, record }: { id: RecordIdString; record: RegistrationRecord }) => {
      return pb
        .collection(Collections.Registrations)
        .update<RegistrationsResponse>(id, record);
    }, mutationConfig
  );
}

export function useRegistrationsQuery(options?: RecordListOptions) {
  return useInfiniteQuery(
    [Collections.Registrations, JSON.stringify(options)],
    ({ pageParam = 1 }) => {
      return pb
        .collection(Collections.Registrations)
        .getList<RegistrationsResponse>(pageParam, undefined, {
          ...options,
          expand: REGISTRATION_RESP_EXPAND,
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

export function useRegistrationFieldsQuery({
  participantType = RegistrationsTypeOptions.student,
  rename = { addons: "addons_data" },
  extraFields = [],
}: {
  participantType?: RegistrationsTypeOptions;
  rename?: Record<string, string>;
  extraFields?: RegistrationField[];
}) {
  return useQuery(
    ["registration_fields", participantType],
    () => {
      return pb.send<RegistrationField[]>(
        `/api/registration_fields?type=${participantType}`,
        { method: "GET" }
      );
    },
    {
      select(data) {
        const dt = (extraFields ?? []).concat(...data);
        if (!rename) {
          return dt;
        }

        return dt.map((f) => {
          if (f.name in rename) {
            return { ...f, name: rename[f.name] };
          }
          return f;
        });
      },
      retry(failureCount, error) {
        if (error instanceof ClientResponseError) {
          if (
            error.status === 403 &&
            error.data.data.type === "registration_status_closed"
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    }
  );
}

export function useRegistrationQuery(
  id: RecordIdString,
  opts = { enabled: true }
) {
  return useQuery(
    [Collections.Registrations, id],
    () => {
      return pb
        .collection(Collections.Registrations)
        .getOne<RegistrationsResponse>(id, {
          expand: REGISTRATION_RESP_EXPAND,
        });
    },
    { enabled: opts.enabled }
  );
}

// Registration Status
export function useUpdateRegistrationStatusMutation() {
  return useMutation(
    ({
      id,
      ...payload
    }: {
      id: RecordIdString
      status: RegistrationStatusesStatusOptions
      reason?: RegistrationStatusesReasonOptions
      remarks?: string
    }) => {
      return pb
        .collection(Collections.RegistrationStatuses)
        .update(id, payload);
    }, mutationConfig
  );
}

// Addons
export function useAddonsQuery() {
  return useQuery([Collections.Addons], () => {
    return pb.collection(Collections.Addons).getFullList<AddonsResponse>();
  }, {
    staleTime: 10 * (60 * 1000),
  });
}

export type AddonOrderResponse = AddonOrdersResponse<{ size?: string }, {
  addon: AddonsResponse
}>

export function useAddonOrdersQuery(options?: RecordListOptions) {
  return useInfiniteQuery(
    [Collections.AddonOrders, 'all', JSON.stringify(options)],
    ({ pageParam = 1 }) => {
      return pb
        .collection(Collections.Registrations)
        .getList<PBRegistrationsResponse<unknown, { status: RegistrationStatusesResponse, addons: AddonOrderResponse[] }>>(pageParam, undefined, {
          ...options,
          fields: ['first_name', 'type', 'last_name', 'email', 'addons','expand'].join(','),
          filter: pbf.stringify(pbf.gte('addons:length', 1)) + (options?.filter ? ` && (${options.filter})` : ''),
          expand: ['status', 'addons', 'addons.addon'].join(','),
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

// Ticket Types
export function useTicketTypesQuery() {
  return useQuery([Collections.TicketTypes], () => {
    return pb.collection(Collections.TicketTypes).getFullList<TicketTypesResponse>();
  }, {
    staleTime: 10 * (60 * 1000),
  });
}

export function useTicketTypeQuery(id: string) {
  return useQuery(
    [Collections.TicketTypes, id],
    () => {
      return pb
        .collection(Collections.TicketTypes)
        .getOne<TicketTypesResponse>(id);
    },
    {
      enabled: typeof id !== "undefined",
    }
  );
}

// Payments
const PAYMENT_RESP_EXPAND = "registrant";

export type PaymentResponse = PaymentsResponse<{
  registrant?: RegistrationRecord;
}>;

export type ManualPaymentResponse = ManualPaymentsResponse<{
  transaction_id: string;
  mobile_number: string;
}, {
  registrant?: RegistrationRecord;
}>;

export function useManualPaymentsQuery(options?: RecordListOptions) {
  return useInfiniteQuery(
    [Collections.ManualPayments, JSON.stringify(options)],
    ({ pageParam = 1 }) => {
      return pb
        .collection(Collections.ManualPayments)
        .getList<ManualPaymentResponse>(pageParam, undefined, {
          ...options,
          expand: PAYMENT_RESP_EXPAND,
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

export function useManualPaymentQuery(id: string, config: { enabled?: boolean } = { enabled: true }) {
  return useQuery([Collections.ManualPayments, id], () => {
      return pb
        .collection(Collections.ManualPayments)
        .getOne<ManualPaymentResponse>(id, {
          expand: PAYMENT_RESP_EXPAND,
        });
    },
    config
  );
}

export function usePaymentsQuery(options?: RecordListOptions) {
  return useInfiniteQuery(
    [Collections.Payments, JSON.stringify(options)],
    ({ pageParam = 1 }) => {
      return pb
        .collection(Collections.Payments)
        .getList<PaymentResponse>(pageParam, undefined, {
          ...options,
          expand: PAYMENT_RESP_EXPAND,
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
      expand: PAYMENT_RESP_EXPAND,
    });
  });
}

export function useUpdatePaymentMutation() {
  return useMutation(
    ({
      id,
      record,
    }: {
      id: RecordIdString;
      record: Partial<ManualPaymentsRecord>;
    }) => {
      return pb
        .collection(Collections.ManualPayments)
        .update<ManualPaymentResponse>(id, record);
    }, mutationConfig
  );
}

export interface InitPaymentPayload {
  registrant_id: string;
  payment_id: string;
  details?: {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    bank_code: string;
  };
  billing?: {
    address: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    name: string;
    email: string;
    phone: string;
  };
}

export function usePaymentMethodsQuery() {
  return useQuery(["payment-methods"], () => {
    return pb.send<PaymentMethod[]>("/api/payment-methods", {});
  });
}

export function useInitiatePaymentMutation() {
  return useMutation((payload: InitPaymentPayload) => {
    return pb.send<InitPaymentResult>("/api/payments/initiate", {
      method: "POST",
      body: payload,
    });
  }, mutationConfig);
}

export function usePaymentMethodMutation() {
  return useMutation(
    async ({
      endpoint,
      apiKey,
      payload,
    }: {
      endpoint: string;
      apiKey: string;
      payload: CreatePaymentMethod;
    }) => {
      if (!endpoint) {
        throw new Error("Endpoint is required.");
      }

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error(
          "Something went wrong while processing your payments. [2]"
        );
      }

      const json = await resp.json();
      return json.data.id as string;
    }, mutationConfig
  );
}

export function useAttachPaymentIntentMutation() {
  return useMutation(
    async ({
      endpoint,
      apiKey,
      paymentMethodId,
      clientKey,
    }: {
      endpoint: string;
      apiKey: string;
      paymentMethodId: string;
      clientKey: string;
    }) => {
      if (!endpoint) {
        throw new Error("Endpoint is required.");
      }

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId,
              client_key: clientKey,
              return_url: pb.buildUrl("/payments_redirect"),
            },
          },
        }),
      });
      if (!resp.ok) {
        throw new Error(
          "Something went wrong while processing your payments. [3]"
        );
      }

      const json = await resp.json();
      return json.data as PaymentIntent;
    }, mutationConfig
  );
}

export function usePaymentIntentQuery(
  paymentIntentEndpoint?: string,
  apiKey?: string,
  clientKey?: string
) {
  return useQuery(
    ["payment_intent", paymentIntentEndpoint],
    async () => {
      const resp = await fetch(
        paymentIntentEndpoint + `?client_key=${clientKey}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${apiKey}`,
          },
        }
      );
      if (!resp.ok) {
        throw new Error("Something went wrong when fetching payment intent.");
      }
      const json = await resp.json();
      return json.data as PaymentIntent;
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  );
}

// Summary
type SummaryEntry = SummaryShare | SummarySubentries;

export interface SummaryShare {
  value: string;
  count: number;
}

export interface SummarySubentries {
  value: string;
  entries: SummaryEntry[];
}

export interface CollectionInsight {
  id: string;
  title: string;
  total: number;
  type: string;
  share: SummaryEntry[];
}

export interface CollectionSummary {
  total: number;
  csv_endpoint: string;
  insights: CollectionInsight[];
}

export function useSummaryQuery(
  collection: Collections,
  {
    filter,
    except = [],
    splittable = [],
    expand = [],
  }: {
    filter?: string;
    except?: string[];
    splittable?: string[];
    expand?: string[];
  }
) {
  return useQuery(["summary", collection, filter, except, splittable], () => {
    const params = new URLSearchParams({
      collection,
      filter: filter ?? "",
      except: except.join(","),
      splittable: splittable.join(","),
      expand: expand.join(","),
    });

    return pb.send<CollectionSummary>(`/api/summary?${params.toString()}`, {
      method: "GET",
    });
  });
}

// Settings
export function useSettingQuery<T = unknown>(key: string) {
  return useQuery([Collections.CustomSettings, key], () => {
    return pb
      .collection(Collections.CustomSettings)
      .getFirstListItem<CustomSettingsResponse<T>>(
        pbf.stringify(pbf.eq("key", key))
      );
  });
}

export function useUpdateSettingMutation() {
  return useMutation(
    async ({ key, value }: { key: string; value: unknown }) => {
      const collection = pb.collection(Collections.CustomSettings);
      const setting = await collection.getFirstListItem(
        pbf.stringify(pbf.eq("key", key))
      );
      return collection.update<CustomSettingsResponse>(setting.id, { value });
    }, mutationConfig
  );
}

// Screening API
export interface ScreeningResponse {
  criteria: Criterion[];
  next_id: string | null;
  prev_id: string | null;
  record: RegistrationsResponse;
}

export interface Criterion {
  id: string;
  label: string;
  description?: string;
  value: boolean;
}

export function useScreeningDetailsQuery(registrantId: string, { enabled = true, filter }: { enabled: boolean, filter?: string }) {
  return useQuery(['screening', registrantId], () => {
    return pb.send<ScreeningResponse>(
      `/api/admin/screening/${registrantId}${filter ? '?' + (new URLSearchParams({filter}).toString()) : '' }`, {});
  }, {
    enabled,
  });
}

// Import / export CSV
export function useImportCsvMutation() {
    return useMutation((payload: {
        import_id: string
        collection: Collections
        mappings?: Record<string, string>
    }) => {
        return pb.send<{ message: string }>('/csv/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    });
}

// export function useInitialImportCsvMutation() {
//     return useMutation((csv: File) => {
//         const fd = new FormData();
//         fd.set('csv', csv);

//         return pb.send<CsvImportsResponse<string[]>>('/csv/initial-import', {
//             method: 'POST',
//             body: fd
//         });
//     });
// }

export function useExportCsvMutation() {
    return useMutation(async ({ collection, fields = [], expand = [], filter }: { collection: `${Collections}`, fields?: string[], expand?: string[], filter?: string }) => {
        const params = (new URLSearchParams({
            collection,
            fields: fields.join(','),
            filter: filter ?? '',
            expand: expand.join(','),

        })).toString();

        const resp = await fetch(pb.buildUrl(`/csv/export?${params}`));
        if (!resp.ok) {
            const json = await resp.json();
            throw new ClientResponseError(json);
        }

        const contentDisposition = resp.headers.get('Content-Disposition') ?? `attachment; filename=${collection}-${(new Date).getTime()}.csv`;
        const filenamePortion = 'filename=';
        const filenameIdx = contentDisposition.indexOf(filenamePortion);
        const filename =  contentDisposition.substring(filenameIdx + filenamePortion.length);
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const virtualDlBtn = document.createElement('a');
        virtualDlBtn.href = url;
        virtualDlBtn.download = filename;
        virtualDlBtn.click();
        return url;
    });
}

// Fields
export function useFieldsQuery(collection: `${Collections}`, { hidden = [], expand = [] }: { hidden?: string[], expand?: string[] } = {}) {
  return useQuery([collection, 'fields', expand], () => {
      const params = new URLSearchParams({ hidden: hidden.join(','), expand: expand.join(',') });
      return pb.send<RegistrationField[]>(`/api/admin/fields/${collection}?${params.toString()}`, { });
  });
}

// Participants
export type ParticipantResponse = ParticipantsResponse<{
  registrant: RegistrationsResponse
}>

export function useParticipantsSearchQuery(filterQuery: pbf.Filter | null) {
  return useQuery([Collections.Participants, filterQuery], () => {
    return pb.collection(Collections.Participants).getFullList<ParticipantResponse>(undefined, {
      filter: pbf.stringify(filterQuery),
      expand: ['registrant'].concat(REGISTRATION_RESP_EXPAND.split(',').map(ex => 'registrant.' + ex)).join(','),
    });
  }, {
    enabled: filterQuery !== null
  });
}

export function useParticipantQuery(id: string) {
  return useQuery([Collections.Participants, id], () => {
    return pb.collection(Collections.Participants).getFirstListItem<ParticipantResponse>(
      pbf.stringify(pbf.eq('pId', id)),
      {
        expand: ['registrant'].concat(REGISTRATION_RESP_EXPAND.split(',').map(ex => 'registrant.' + ex)).join(','),
      });
  }, {
    enabled: id.length !== 0
  });
}

export function useParticipantMutation() {
  return useMutation((record: Partial<ParticipantsRecord> & { id: RecordIdString }) => {
    return pb.collection(Collections.Participants).update(record.id, record);
  });
}
