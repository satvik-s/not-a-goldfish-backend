import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

import { getDynamoClientAndTable } from './utils/dynamo';

export async function main(event: {
    queryStringParameters?: Record<string, string>;
}) {
    try {
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
            KeyConditionExpression: 'user_id = :user',
            ExpressionAttributeValues: {
                ':user': {
                    S: event.queryStringParameters.user_id,
                },
            },
            ReturnConsumedCapacity: 'TOTAL',
        });

        const queryItemOutput = await client.send(queryItemCommand);
        console.info(queryItemOutput);
        const items = queryItemOutput.Items;

        return {
            body: JSON.stringify(
                (items ?? []).map((item) => {
                    const unmarshalledItem = unmarshall(item);
                    return {
                        id: unmarshalledItem.url_id,
                        url: unmarshalledItem.url,
                    };
                }),
            ),
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control':
                    'public, max-age=600, s-maxage=600, stale-while-revalidate=300',
            },
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
