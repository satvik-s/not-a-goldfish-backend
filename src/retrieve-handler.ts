import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { getDynamoClientAndTable } from './utils/dynamo';

export async function main(event: {
    queryStringParameters?: Record<string, string>;
}) {
    if (!event.queryStringParameters?.user_id) {
        return {
            body: 'Bad Request',
            headers: { 'Content-Type': 'text/plain' },
            statusCode: 400,
        };
    }

    const [client, tableName] = getDynamoClientAndTable();

    const queryItemCommand = new QueryCommand({
        TableName: tableName,
        KeyConditions: {
            user_id: {
                ComparisonOperator: 'EQ',
                AttributeValueList: [
                    marshall({ user_id: event.queryStringParameters.user_id })[
                        'user_id'
                    ],
                ],
            },
        },
        ReturnConsumedCapacity: 'TOTAL',
    });

    const queryItemOutput = await client.send(queryItemCommand);
    const items = queryItemOutput.Items;

    return {
        body: JSON.stringify((items ?? []).map((item) => unmarshall(item).url)),
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
    };
}
