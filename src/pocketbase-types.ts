/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	AddonOrders = "addon_orders",
	Addons = "addons",
	CustomSettings = "custom_settings",
	DuplicateRegistrations = "duplicate_registrations",
	FormDetails = "form_details",
	FormGroups = "form_groups",
	ManualPayments = "manual_payments",
	MerchSensingData = "merch_sensing_data",
	Participants = "participants",
	Payments = "payments",
	ProfessionalProfiles = "professional_profiles",
	RegistrationStatuses = "registration_statuses",
	Registrations = "registrations",
	SchoolProfileSummary = "school_profile_summary",
	StudentProfiles = "student_profiles",
	TicketTypes = "ticket_types",
	TopicInterests = "topic_interests",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AddonOrdersRecord<Tpreferences = unknown> = {
	addon: RecordIdString
	preferences?: null | Tpreferences
	registrant?: RecordIdString
}

export type AddonsRecord<Tcustomization_options = unknown> = {
	cover_image?: string
	customization_options?: null | Tcustomization_options
	description?: HTMLString
	price?: number
	title?: string
}

export type CustomSettingsRecord<Tvalue = unknown> = {
	key: string
	value: null | Tvalue
}

export type DuplicateRegistrationsRecord<Tids = unknown> = {
	first_name: string
	ids?: null | Tids
	last_name: string
	occurrences?: number
}

export enum FormDetailsFormGroupOptions {
	"welcome" = "welcome",
	"profile" = "profile",
	"topic" = "topic",
	"addOn" = "addOn",
	"payment" = "payment",
	"done" = "done",
}
export type FormDetailsRecord<Tcustom_options = unknown> = {
	custom_options?: null | Tcustom_options
	description?: string
	form_group: FormDetailsFormGroupOptions
	key: string
	title: string
}

export enum FormGroupsKeyOptions {
	"welcome" = "welcome",
	"profile" = "profile",
	"topic" = "topic",
	"addOn" = "addOn",
	"payment" = "payment",
	"done" = "done",
}
export type FormGroupsRecord<Tcustom_content = unknown> = {
	custom_content?: null | Tcustom_content
	description?: string
	key: FormGroupsKeyOptions
	route_key: string
	short_title?: string
	show_in_stepper?: boolean
	title: string
}

export type ManualPaymentsRecord<Ttransaction_details = unknown> = {
	amount_paid?: number
	expected_amount: number
	has_refunded?: boolean
	is_verified?: boolean
	receipt?: string
	registrant?: RecordIdString
	transaction_details: null | Ttransaction_details
}

export enum MerchSensingDataMerchSpendingLimitOptions {
	"₱150-₱250" = "₱150-₱250",
	"₱250-₱450" = "₱250-₱450",
	"₱450-₱600" = "₱450-₱600",
	"₱600-₱1,000" = "₱600-₱1,000",
}
export type MerchSensingDataRecord<Tpreferred_offered_merch = unknown> = {
	merch_spending_limit: MerchSensingDataMerchSpendingLimitOptions
	other_preferred_offered_merch?: string
	preferred_offered_merch?: null | Tpreferred_offered_merch
	registrant?: RecordIdString
}

export enum ParticipantsStatusOptions {
	"unchecked" = "unchecked",
	"present" = "present",
	"absent" = "absent",
}
export type ParticipantsRecord = {
	is_addon_claimed?: boolean
	pId: string
	registrant: RecordIdString
	remarks?: string
	status: ParticipantsStatusOptions
}

export enum PaymentsStatusOptions {
	"unpaid" = "unpaid",
	"pending" = "pending",
	"paid" = "paid",
}
export type PaymentsRecord = {
	expected_amount?: number
	payment_intent_id?: string
	registrant?: RecordIdString
	status?: PaymentsStatusOptions
}

export type ProfessionalProfilesRecord = {
	is_fresh_graduate?: boolean
	organization: string
	registrant?: RecordIdString
	title: string
}

export enum RegistrationStatusesStatusOptions {
	"pending" = "pending",
	"approved" = "approved",
	"rejected" = "rejected",
}

export enum RegistrationStatusesReasonOptions {
	"unqualified" = "unqualified",
	"refund" = "refund",
	"duplicate" = "duplicate",
	"others" = "others",
}
export type RegistrationStatusesRecord = {
	reason?: RegistrationStatusesReasonOptions
	registrant?: RecordIdString
	remarks?: string
	status: RegistrationStatusesStatusOptions
}

export enum RegistrationsTypeOptions {
	"student" = "student",
	"professional" = "professional",
}

export enum RegistrationsSexOptions {
	"male" = "male",
	"female" = "female",
}

export enum RegistrationsAgeRangeOptions {
	"below 18" = "below 18",
	"18-20" = "18-20",
	"21-24" = "21-24",
	"25-30" = "25-30",
	"31-34" = "31-34",
	"35-40" = "35-40",
	"41-50" = "41-50",
	"50+" = "50+",
}

export enum RegistrationsYearsTechExpOptions {
	"No Experience" = "No Experience",
	"Less than 1 year" = "Less than 1 year",
	"1-2 years" = "1-2 years",
	"2-5 years" = "2-5 years",
	"5-10 years" = "5-10 years",
	"More than 10 years" = "More than 10 years",
}
export type RegistrationsRecord<Ttopic_interests = unknown> = {
	addons?: RecordIdString[]
	age_range?: RegistrationsAgeRangeOptions
	contact_number?: string
	email: string
	first_name: string
	last_name: string
	merch_sensing_data?: RecordIdString
	payment?: RecordIdString
	professional_profile?: RecordIdString
	sex?: RegistrationsSexOptions
	status?: RecordIdString
	student_profile?: RecordIdString
	ticket: RecordIdString
	topic_interests: null | Ttopic_interests
	type: RegistrationsTypeOptions
	years_tech_exp: RegistrationsYearsTechExpOptions
}

export type SchoolProfileSummaryRecord = {
	count?: number
	school: string
}

export enum StudentProfilesYearLevelOptions {
	"1st Year" = "1st Year",
	"2nd Year" = "2nd Year",
	"3rd Year" = "3rd Year",
	"4th Year" = "4th Year",
	"5th Year" = "5th Year",
}
export type StudentProfilesRecord = {
	designation: string
	registrant?: RecordIdString
	school: string
	year_level: StudentProfilesYearLevelOptions
}

export type TicketTypesRecord = {
	description?: HTMLString
	name: string
	price: number
}

export type TopicInterestsRecord = {
	icon?: string
	key: string
	topic_name: string
}

// Response types include system fields and match responses from the PocketBase API
export type AddonOrdersResponse<Tpreferences = unknown, Texpand = unknown> = Required<AddonOrdersRecord<Tpreferences>> & BaseSystemFields<Texpand>
export type AddonsResponse<Tcustomization_options = unknown, Texpand = unknown> = Required<AddonsRecord<Tcustomization_options>> & BaseSystemFields<Texpand>
export type CustomSettingsResponse<Tvalue = unknown, Texpand = unknown> = Required<CustomSettingsRecord<Tvalue>> & BaseSystemFields<Texpand>
export type DuplicateRegistrationsResponse<Tids = unknown, Texpand = unknown> = Required<DuplicateRegistrationsRecord<Tids>> & BaseSystemFields<Texpand>
export type FormDetailsResponse<Tcustom_options = unknown, Texpand = unknown> = Required<FormDetailsRecord<Tcustom_options>> & BaseSystemFields<Texpand>
export type FormGroupsResponse<Tcustom_content = unknown, Texpand = unknown> = Required<FormGroupsRecord<Tcustom_content>> & BaseSystemFields<Texpand>
export type ManualPaymentsResponse<Ttransaction_details = unknown, Texpand = unknown> = Required<ManualPaymentsRecord<Ttransaction_details>> & BaseSystemFields<Texpand>
export type MerchSensingDataResponse<Tpreferred_offered_merch = unknown, Texpand = unknown> = Required<MerchSensingDataRecord<Tpreferred_offered_merch>> & BaseSystemFields<Texpand>
export type ParticipantsResponse<Texpand = unknown> = Required<ParticipantsRecord> & BaseSystemFields<Texpand>
export type PaymentsResponse<Texpand = unknown> = Required<PaymentsRecord> & BaseSystemFields<Texpand>
export type ProfessionalProfilesResponse<Texpand = unknown> = Required<ProfessionalProfilesRecord> & BaseSystemFields<Texpand>
export type RegistrationStatusesResponse<Texpand = unknown> = Required<RegistrationStatusesRecord> & BaseSystemFields<Texpand>
export type RegistrationsResponse<Ttopic_interests = unknown, Texpand = unknown> = Required<RegistrationsRecord<Ttopic_interests>> & BaseSystemFields<Texpand>
export type SchoolProfileSummaryResponse<Texpand = unknown> = Required<SchoolProfileSummaryRecord> & BaseSystemFields<Texpand>
export type StudentProfilesResponse<Texpand = unknown> = Required<StudentProfilesRecord> & BaseSystemFields<Texpand>
export type TicketTypesResponse<Texpand = unknown> = Required<TicketTypesRecord> & BaseSystemFields<Texpand>
export type TopicInterestsResponse<Texpand = unknown> = Required<TopicInterestsRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	addon_orders: AddonOrdersRecord
	addons: AddonsRecord
	custom_settings: CustomSettingsRecord
	duplicate_registrations: DuplicateRegistrationsRecord
	form_details: FormDetailsRecord
	form_groups: FormGroupsRecord
	manual_payments: ManualPaymentsRecord
	merch_sensing_data: MerchSensingDataRecord
	participants: ParticipantsRecord
	payments: PaymentsRecord
	professional_profiles: ProfessionalProfilesRecord
	registration_statuses: RegistrationStatusesRecord
	registrations: RegistrationsRecord
	school_profile_summary: SchoolProfileSummaryRecord
	student_profiles: StudentProfilesRecord
	ticket_types: TicketTypesRecord
	topic_interests: TopicInterestsRecord
}

export type CollectionResponses = {
	addon_orders: AddonOrdersResponse
	addons: AddonsResponse
	custom_settings: CustomSettingsResponse
	duplicate_registrations: DuplicateRegistrationsResponse
	form_details: FormDetailsResponse
	form_groups: FormGroupsResponse
	manual_payments: ManualPaymentsResponse
	merch_sensing_data: MerchSensingDataResponse
	participants: ParticipantsResponse
	payments: PaymentsResponse
	professional_profiles: ProfessionalProfilesResponse
	registration_statuses: RegistrationStatusesResponse
	registrations: RegistrationsResponse
	school_profile_summary: SchoolProfileSummaryResponse
	student_profiles: StudentProfilesResponse
	ticket_types: TicketTypesResponse
	topic_interests: TopicInterestsResponse
}