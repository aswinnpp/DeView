export function zodToFastifyBody(zodSchema: any) {
    const schema = zodSchema.toJSONSchema();
    delete schema.$schema;
    return schema;
}

export function zodToFastifyParams(zodSchema: any) {
    const schema = zodSchema.toJSONSchema();
    delete schema.$schema;
    return schema;
}
