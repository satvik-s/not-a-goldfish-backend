import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
    Code,
    Function,
    FunctionUrlAuthType,
    HttpMethod,
    Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export class HelloWorldLambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new Table(this, 'not-a-goldfish-data-table', {
            tableName: 'not-a-goldfish-data-table',
            readCapacity: 1,
            writeCapacity: 1,
            removalPolicy: RemovalPolicy.DESTROY,
            replicationRegions: [],
            partitionKey: {
                name: 'user_id',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'timestamp',
                type: AttributeType.NUMBER,
            },
            billingMode: BillingMode.PROVISIONED,
        });

        const createLambdaFn = new Function(
            this,
            'not-a-goldfish-create-function',
            {
                code: Code.fromAsset(
                    path.join(__dirname, '/../dist-create-function'),
                ),
                handler: 'create-handler.main',
                runtime: Runtime.NODEJS_14_X,

                description: 'not a goldfish function',
                timeout: Duration.seconds(1),
                functionName: 'not-a-goldfish-create-function',
                memorySize: 128,
                logRetention: RetentionDays.THREE_DAYS,
                currentVersionOptions: {
                    removalPolicy: RemovalPolicy.DESTROY,
                },
                environment: {
                    TABLE_AWS_REGION: process.env.AWS_DEFAULT_REGION ?? '',
                },
            },
        );

        createLambdaFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.POST],
                allowedOrigins: ['*'],
                maxAge: Duration.minutes(1),
            },
        });

        table.grantReadWriteData(createLambdaFn);

        const retrieveLambdaFn = new Function(
            this,
            'not-a-goldfish-retrieve-function',
            {
                code: Code.fromAsset(
                    path.join(__dirname, '/../dist-retrieve-function'),
                ),
                handler: 'retrieve-handler.main',
                runtime: Runtime.NODEJS_14_X,

                description: 'not a goldfish retrieve function',
                timeout: Duration.seconds(1),
                functionName: 'not-a-goldfish-retrieve-function',
                memorySize: 128,
                logRetention: RetentionDays.THREE_DAYS,
                currentVersionOptions: {
                    removalPolicy: RemovalPolicy.DESTROY,
                },
                environment: {
                    TABLE_AWS_REGION: process.env.AWS_DEFAULT_REGION ?? '',
                },
            },
        );

        retrieveLambdaFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.GET],
                allowedOrigins: ['*'],
                maxAge: Duration.minutes(1),
            },
        });

        table.grantReadData(retrieveLambdaFn);
    }
}
