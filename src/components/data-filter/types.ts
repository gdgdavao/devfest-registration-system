import { Filter } from "@nedpals/pbf"

export interface DataFilterMeta {
    type: string
    values?: string[]
    collectionId?: string
}

export type DataFilterValue<T extends Filter = Filter> = T & { meta: DataFilterMeta } 
