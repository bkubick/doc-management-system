import * as cdk from '@aws-cdk/core';

import { AppDatabase } from './database';
import { AssetStorage } from './storage';
import { WebApp } from './webapp';

export class ApplicationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const storage: AssetStorage = new AssetStorage(this, 'Storage');

    new cdk.CfnOutput(this, 'AssetStorageCreation', {
      value: 'AssetStorage created successfully'
    });

    new WebApp(this, 'WebApp', {
      hostingBucket: storage.hostingBucket,
      relativeWebAppPath: 'webapp',
      baseDirectory: '../',
    });

    new AppDatabase(this, 'Database');

    new cdk.CfnOutput(this, 'DatabaseCreation', {
      value: 'Database created successfully'
    });
  }
}
