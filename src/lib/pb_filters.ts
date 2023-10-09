// PocketBase type-safe filter builders
const ops = {
    par: '', // (expr)
    and: '&&',
    or: '||',
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: '~',
    nlike: '!~',
    any: '?=',
    nany: '?!=',
    anygt: '?>',
    anygte: '?>=',
    anylt: '?<',
    anylte: '?<=',
    anylike: '?~',
    nanylike: '?!~',
} as const;

const inverse: Record<FilterOp, FilterOp> = {
    par: 'par',
    and: 'or',
    or: 'and',
    eq: 'neq',
    gt: 'lte',
    gte: 'lt',
    lt: 'gte',
    lte: 'gt',
    like: 'nlike',
    any: 'nany',
    anygt: 'anylte',
    anygte: 'anylt',
    anylt: 'anygte',
    anylte: 'anygt',
    anylike: 'nanylike',
    neq: 'eq',
    nany: 'any',
    nanylike: 'anylike',
    nlike: 'like',
} as const;

type Falsey = null | undefined | 0 | "" | false;
export type FilterOp = keyof typeof ops;
export type OpValue = number | boolean | string | undefined | null;

export interface FilterExpr<T = FilterOp> {
    op: T
    lhs?: FilterExpr | string
    rhs?: FilterExpr | string
}

export type MaybeFilterExpr<T = FilterOp> = FilterExpr<T> | null;

function wrapValue(value: unknown): string | null {
    switch (typeof value) {
    case 'string':
        return `"${value}"`;
    case "number":
    case "bigint":
    case "boolean":
        return `${value}`;
    case "object":
        return `${JSON.stringify(value)}`;
    default:
        return null;
    }
}

function groupExpr<T extends 'and' | 'or'>(ops: T, exprs: MaybeMaybeFilterExpr[]): MaybeFilterExpr<T> {
    const filtered = exprs.filter(Boolean) as FilterExpr[];
    if (filtered.length === 0) return null;
    let expr: FilterExpr<T> = {op: ops};

    for (let i = 0; i < filtered.length - 2; i++) {
        const fExpr = filtered[i];
        if (fExpr.op === 'and' || fExpr.op === 'or') {
            expr = {
                lhs: par({
                    lhs: par(fExpr)!,
                    op: ops,
                    rhs: expr
                })!,
                op: ops,
            }
        } else {
            expr = {
                lhs: expr,
                op: ops
            }
        }
    }

    expr.rhs = filtered[filtered.length - 1];
    return expr;
}

type MaybeMaybeFilterExpr<T extends FilterOp = FilterOp> = MaybeFilterExpr<T> | Falsey;

export function and(...exprs: MaybeMaybeFilterExpr[]) {
    return groupExpr('and', exprs);
}

export function or(...exprs: MaybeMaybeFilterExpr[]) {
    return groupExpr('or', exprs);
}

export function par(expr: FilterExpr): MaybeFilterExpr<"par"> {
    if (!expr) return null;
    if (expr.op === 'par') {
        return expr as FilterExpr<"par">;
    }
    return {op: 'par', rhs: expr};
}

export function not<T extends keyof typeof inverse>(expr: MaybeFilterExpr<T> | string): MaybeFilterExpr<typeof inverse[T]> | string {
    if (!expr || typeof expr === 'string') {
        return expr;
    }

    return {
        lhs: not(expr.lhs ?? null) ?? undefined,
        op: inverse[expr.op],
        rhs: not(expr.rhs ?? null) ?? undefined
    }
}

function wrapOp<T extends FilterOp>(op: T) {
    const closure = (collection: string, value: OpValue | OpValue[]): MaybeFilterExpr<T | "or"> => {
        if (Array.isArray(value)) {
            return or(...value.map(v => closure(collection, v)));
        }
        const finalValue = wrapValue(value);
        if (!finalValue) return null;
        return {op, lhs: collection, rhs: finalValue};
    }
    return closure;
}

export const eq = wrapOp('eq');
export const gt = wrapOp('gt');
export const gte = wrapOp('gte');
export const lt = wrapOp('lt');
export const lte = wrapOp('lte');
export const like = wrapOp('like');
export const any = wrapOp('any');
export const anygt = wrapOp('anygt');
export const anygte = wrapOp('anygte');
export const anylt = wrapOp('anylt');
export const anylte = wrapOp('anylte');
export const anylike = wrapOp('anylike');

export function compileFilter(...exprs: MaybeMaybeFilterExpr[]): string {
    const filtered = exprs.filter(Boolean) as FilterExpr[];
    if (filtered.length > 1) {
        return compileFilter(and(...filtered));
    } else if (!filtered[0]) {
        return '';
    }

    const expr = filtered[0];
    switch (expr.op) {
    case 'par':
        if (!expr.rhs) return '';
        if (typeof expr.rhs === 'string') return expr.rhs;
        return `(${compileFilter(expr.rhs ?? null)})`;
    default: {
        const lhs = typeof expr.lhs === 'string' ? expr.lhs : compileFilter(expr.lhs!);
        const rhs = typeof expr.rhs === 'string' ? expr.rhs : compileFilter(expr.rhs!);
        return `${lhs} ${ops[expr.op]} ${rhs}`;
    }
    }
}
