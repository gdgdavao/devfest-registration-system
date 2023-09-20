/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Bundles = "bundles",
	FormDetails = "form_details",
	Payments = "payments",
	ProfessionalProfiles = "professional_profiles",
	RegistrationStatuses = "registration_statuses",
	Registrations = "registrations",
	SlotCounter = "slot_counter",
	StudentProfiles = "student_profiles",
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

export type BundlesRecord = {
	cover_image?: string
	description?: HTMLString
	includes?: HTMLString
	price?: number
	title?: string
}

export type FormDetailsRecord<Tcustom_options = unknown> = {
	custom_options?: null | Tcustom_options
	description?: string
	key: string
	title: string
}

export enum PaymentsStatusOptions {
	"unpaid" = "unpaid",
	"pending" = "pending",
	"paid" = "paid",
}
export type PaymentsRecord = {
	registrant: RecordIdString
	status: PaymentsStatusOptions
	transaction_id?: string
}

export type ProfessionalProfilesRecord = {
	is_fresh_graduate?: boolean
	organization: string
	registrant: RecordIdString
	title: string
}

export enum RegistrationStatusesStatusOptions {
	"pending" = "pending",
	"approved" = "approved",
	"rejected" = "rejected",
}
export type RegistrationStatusesRecord = {
	registrant?: RecordIdString
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
	"31-34-35-40" = "31-34-35-40",
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
	age_range?: RegistrationsAgeRangeOptions
	contact_number?: string
	email: string
	first_name: string
	last_name: string
	payment?: RecordIdString
	professional_profile?: RecordIdString
	selected_bundle?: RecordIdString
	sex?: RegistrationsSexOptions
	status?: RecordIdString
	student_profile?: RecordIdString
	topic_interests: null | Ttopic_interests
	type?: RegistrationsTypeOptions
	years_tech_exp: RegistrationsYearsTechExpOptions
}

export enum SlotCounterTypeOptions {
	"student" = "student",
	"professional" = "professional",
}
export type SlotCounterRecord = {
	slots_registered?: number
	type?: SlotCounterTypeOptions
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
	registrant: RecordIdString
	school: string
	year_level: StudentProfilesYearLevelOptions
}

export type TopicInterestsRecord = {
	key: string
	topic_name: string
}

// Response types include system fields and match responses from the PocketBase API
export type BundlesResponse<Texpand = unknown> = Required<BundlesRecord> & BaseSystemFields<Texpand>
export type FormDetailsResponse<Tcustom_options = unknown, Texpand = unknown> = Required<FormDetailsRecord<Tcustom_options>> & BaseSystemFields<Texpand>
export type PaymentsResponse<Texpand = unknown> = Required<PaymentsRecord> & BaseSystemFields<Texpand>
export type ProfessionalProfilesResponse<Texpand = unknown> = Required<ProfessionalProfilesRecord> & BaseSystemFields<Texpand>
export type RegistrationStatusesResponse<Texpand = unknown> = Required<RegistrationStatusesRecord> & BaseSystemFields<Texpand>
export type RegistrationsResponse<Ttopic_interests = unknown, Texpand = unknown> = Required<RegistrationsRecord<Ttopic_interests>> & BaseSystemFields<Texpand>
export type SlotCounterResponse<Texpand = unknown> = Required<SlotCounterRecord> & BaseSystemFields<Texpand>
export type StudentProfilesResponse<Texpand = unknown> = Required<StudentProfilesRecord> & BaseSystemFields<Texpand>
export type TopicInterestsResponse<Texpand = unknown> = Required<TopicInterestsRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	bundles: BundlesRecord
	form_details: FormDetailsRecord
	payments: PaymentsRecord
	professional_profiles: ProfessionalProfilesRecord
	registration_statuses: RegistrationStatusesRecord
	registrations: RegistrationsRecord
	slot_counter: SlotCounterRecord
	student_profiles: StudentProfilesRecord
	topic_interests: TopicInterestsRecord
}

export type CollectionResponses = {
	bundles: BundlesResponse
	form_details: FormDetailsResponse
	payments: PaymentsResponse
	professional_profiles: ProfessionalProfilesResponse
	registration_statuses: RegistrationStatusesResponse
	registrations: RegistrationsResponse
	slot_counter: SlotCounterResponse
	student_profiles: StudentProfilesResponse
	topic_interests: TopicInterestsResponse
}