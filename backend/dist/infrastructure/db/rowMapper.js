export function mapRow(row) {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
        const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        out[camel] = v;
        if (v instanceof Date)
            out[camel] = v;
    }
    return out;
}
export function mapRows(rows) {
    return rows.map((r) => mapRow(r));
}
//# sourceMappingURL=rowMapper.js.map