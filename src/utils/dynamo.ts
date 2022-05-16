import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = 'not-a-goldfish-data-table';
const client = new DynamoDBClient({ region: process.env.TABLE_AWS_REGION });

export function getDynamoClientAndTable(): [DynamoDBClient, string] {
    return [client, TABLE_NAME];
}
