import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { getDynamoClientAndTable } from './utils/dynamo';

export async function main(event: { body?: string }) {
    const body = JSON.parse(event.body ?? '{}');
    if (!body.user_id || !body.url) {
        return {
            body: 'Bad Request',
            headers: { 'Content-Type': 'text/plain' },
            statusCode: 400,
        };
    }

    const [client, tableName] = getDynamoClientAndTable();

    const record = {
        user_id: body.user_id,
        timestamp: Date.now(),
        url: body.url,
    };

    const putItemCommand = new PutItemCommand({
        TableName: tableName,
        Item: marshall(record),
        ReturnConsumedCapacity: 'TOTAL',
    });

    await client.send(putItemCommand);

    return {
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
    };
}
