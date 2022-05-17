import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';

import { getDynamoClientAndTable } from './utils/dynamo';

const ONE_MONTH_SECONDS = 2_628_000;

export async function main(event: { body?: string }) {
    try {
        const body = JSON.parse(event.body ?? '{}');
        if (!body.user_id || !body.url) {
            return {
                body: 'Bad Request',
                headers: { 'Content-Type': 'text/plain' },
                statusCode: 400,
            };
        }

        const [client, tableName] = getDynamoClientAndTable();

        const currentTimestamp = Math.floor(Date.now() / 1000);
        const record = {
            expire_at: currentTimestamp + 6 * ONE_MONTH_SECONDS,
            last_modified_at: currentTimestamp,
            user_id: body.user_id,
            url_id: randomUUID(),
            url: body.url,
        };

        const putItemCommand = new PutItemCommand({
            TableName: tableName,
            Item: marshall(record),
            ReturnConsumedCapacity: 'TOTAL',
        });

        const putItemOutput = await client.send(putItemCommand);
        console.info(putItemOutput);

        return {
            body: JSON.stringify(record),
            headers: { 'Content-Type': 'application/json' },
            statusCode: 200,
        };
    } catch (error) {
        console.error(error.message);
        return {
            body: 'Internal Server Error',
            headers: { 'Content-Type': 'application/json' },
            statusCode: 500,
        };
    }
}
