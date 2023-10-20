import { FilterExpr, FilterOp } from "@/lib/pb_filters"

export interface DataFilterValue<T = FilterOp> {
    type: string
    values?: string[]
    collectionId?: string
    expr: FilterExpr<T>
}
