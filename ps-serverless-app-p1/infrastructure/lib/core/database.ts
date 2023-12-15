import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

/**
 * Creates the documents table.
 * 
 * @param construct the construct to create the table in.
 * @returns the created table.
 */
function createDocumentsTable(construct: cdk.Construct): dynamodb.Table {
    const documentsTable = new dynamodb.Table(construct, 'DocumentsTable', {
        partitionKey: {
            name: 'PK',
            type: dynamodb.AttributeType.STRING
        },
        sortKey: {
            name: 'SK',
            type: dynamodb.AttributeType.STRING
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    documentsTable.addGlobalSecondaryIndex({
        indexName: 'GSI1',
        partitionKey: {
            name: 'PK',
            type: dynamodb.AttributeType.STRING
        },
        sortKey: {
            name: 'SK',
            type: dynamodb.AttributeType.STRING
        },
        projectionType: dynamodb.ProjectionType.INCLUDE,
        nonKeyAttributes: ['DateUploaded', 'Processed', 'Thumbnail', 'Uploader', 'FileSize', 'Name', 'Owner']
    });

    return documentsTable;
}


class AppDatabase extends cdk.Construct {

    public readonly documentsTable: dynamodb.ITable;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        this.documentsTable = createDocumentsTable(this);
    }
}

export { AppDatabase };
