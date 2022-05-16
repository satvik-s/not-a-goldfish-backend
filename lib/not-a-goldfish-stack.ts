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

export class NotAGoldfishStack extends Stack {
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
                name: 'url_id',
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PROVISIONED,
            timeToLiveAttribute: 'expire_at',
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

        table.grantWriteData(createLambdaFn);

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

        const deleteLambdaFn = new Function(
            this,
            'not-a-goldfish-delete-function',
            {
                code: Code.fromAsset(
                    path.join(__dirname, '/../dist-delete-function'),
                ),
                handler: 'delete-handler.main',
                runtime: Runtime.NODEJS_14_X,

                description: 'not a goldfish delete function',
                timeout: Duration.seconds(1),
                functionName: 'not-a-goldfish-delete-function',
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

        deleteLambdaFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.DELETE],
                allowedOrigins: ['*'],
                maxAge: Duration.minutes(1),
            },
        });

        table.grantWriteData(deleteLambdaFn);
    }
}
