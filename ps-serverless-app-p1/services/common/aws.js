import * as AWS from 'aws-sdk';


let _dynamoDb;

const dynamoDb = () => {
    if (!_dynamoDb) {
        _dynamoDb = new AWS.DynamoDB.DocumentClient();
    }
    return _dynamoDb;
};

export const AWSClient = {
    dynamoDb,
};
