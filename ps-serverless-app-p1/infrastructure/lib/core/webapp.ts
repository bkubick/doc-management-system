import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cwt from 'cdk-webapp-tools';


interface WebAppProps {
    hostingBucket: s3.IBucket;
    relativeWebAppPath: string;
    baseDirectory: string;
}


class WebApp extends cdk.Construct {

    public readonly webDistribution: cloudfront.CloudFrontWebDistribution

    constructor(scope: cdk.Construct, id: string, props: WebAppProps) {
        super(scope, id);

        const oai = new cloudfront.OriginAccessIdentity(this, 'WebHostingOAI', {});

        const cloudFrontProps: any = {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: props.hostingBucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                        },
                    ],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                    errorCachingMinTtl: 86400,
                },
                {
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                    errorCachingMinTtl: 86400,
                }
            ],
        }

        this.webDistribution = new cloudfront.CloudFrontWebDistribution(
            this,
            'Distribution',
            cloudFrontProps,
        );

        props.hostingBucket.grantRead(oai);

        // Deploy the webapp
        new cwt.WebAppDeployment(this, 'WebAppDeployment', {
            baseDirectory: props.baseDirectory,
            relativeWebAppPath: props.relativeWebAppPath,
            webDistribution: this.webDistribution,
            webDistributionPaths: ['/*'],
            buildCommand: 'yarn build',
            buildDirectory: 'build',
            prune: true,
            bucket: props.hostingBucket,
        });

        new cdk.CfnOutput(this, 'WebAppDeployed', {
            value: 'Webapp deployed successfully'
        });

        new cdk.CfnOutput(this, 'URL', {
            value: `https://${this.webDistribution.distributionDomainName}`,
        });
    }
}


export { WebApp };
