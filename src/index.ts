export async function main(_event: unknown) {
    return {
        body: JSON.stringify({ hello: 'world' }),
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
    };
}
