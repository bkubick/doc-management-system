import * as cdk from '@aws-cdk/core';

import { AppDatabase } from './database';
import { Services } from './services';
import { AssetStorage } from './storage';
import { WebApp } from './webapp';

export class ApplicationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const storage: AssetStorage = new AssetStorage(this, 'Storage');

    new cdk.CfnOutput(this, 'AssetStorageCreation', {
      value: 'AssetStorage created successfully'
    });

    const appDatabase = new AppDatabase(this, 'Database');

    new cdk.CfnOutput(this, 'DatabaseCreation', {
      value: 'Database created successfully'
    });

    new Services(this, 'Services', {
      documentsTable: appDatabase.documentsTable,
    });

    new cdk.CfnOutput(this, 'ServicesCreation', {
      value: 'Services created successfully'
    });

    new WebApp(this, 'WebApp', {
      hostingBucket: storage.hostingBucket,
      relativeWebAppPath: 'webapp',
      baseDirectory: '../',
    });

    new cdk.CfnOutput(this, 'WebAppCreation', {
      value: 'WebApp created successfully'
    });
  }
}
