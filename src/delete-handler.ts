import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';

import { getDynamoClientAndTable } from './utils/dynamo';

export async function main(event: { body?: string }) {
    const body = JSON.parse(event.body ?? '{}');
    if (!body.user_id || !body.url_id) {
        return {
            body: 'Bad Request',
            headers: { 'Content-Type': 'text/plain' },
            statusCode: 400,
        };
    }

    const [client, tableName] = getDynamoClientAndTable();

    const deleteItemCommand = new DeleteItemCommand({
        TableName: tableName,
        Key: {
            user_id: {
                S: body.user_id,
            },
            url_id: {
                S: body.url_id,
            },
        },
        ReturnConsumedCapacity: 'TOTAL',
    });

    await client.send(deleteItemCommand);

    return {
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
    };
}
