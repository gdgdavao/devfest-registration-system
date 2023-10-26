import { ComparisonFilter } from "@nedpals/pbf"

export interface DataFilterMeta {
    type: string
    values?: string[]
    collectionId?: string
}

export type DataFilterValue = ComparisonFilter & { meta: DataFilterMeta }
