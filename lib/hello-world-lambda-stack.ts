import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
    Code,
    Function,
    FunctionUrlAuthType,
    HttpMethod,
    Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class HelloWorldLambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const lambdaFn = new Function(this, 'hello-world-lambda-function', {
            code: Code.fromAsset(__dirname + '/../dist'),
            handler: 'index.main',
            runtime: Runtime.NODEJS_14_X,

            description: 'hello world lambda function',
            timeout: Duration.seconds(1),
            functionName: 'hello-world-lambda-function',
            memorySize: 128,
            logRetention: RetentionDays.THREE_DAYS,
            currentVersionOptions: {
                removalPolicy: RemovalPolicy.DESTROY,
            },
        });

        lambdaFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.GET],
                allowedOrigins: ['*'],
                maxAge: Duration.minutes(1),
            },
        });
    }
}
