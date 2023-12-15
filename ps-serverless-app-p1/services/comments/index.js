import {
    createRouter,
    RouterType,
    Matcher,
    validatePathVariables,
    validateBodyJSONVariables
} from 'lambda-micro';

import { AWSClient, generateId } from '../common';

// ------------------------------------------------------------
// Database Setup
// ------------------------------------------------------------
const dynamoDb = new AWSClient.dynamoDb();
// DYNAMO_TB_TABLE is an environment variable set as an env variable
const tableName = process.env.DYNAMO_DB_TABLE;

// ------------------------------------------------------------
// Router Setup
// ------------------------------------------------------------
const router = createRouter(RouterType.HTTP_API_V2);

const schemas = {
    createComment: require('./schemas/createComment.json'),
    deleteComment: require('./schemas/deleteComment.json'),
    getComments: require('./schemas/getComments.json'),
};

// ------------------------------------------------------------
// Route Handlers
// ------------------------------------------------------------
const getAllCommentsForDocument = async (request, response) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': request.pathVariables.docid,
            ':sk': 'Comment',
        },
    };

    const results = await dynamoDb.query(params).promise();

    return response.output(results.Items, 200);
}


const createComment = async (request, response) => {
    const userId = 'fc4cec10-6ae4-435c-98ca-6964382fee77';
    const item = {
        PK: request.pathVariables.docid,
        SK: `Comment#${generateId()}`,
        DateAdded: new Date().toISOString(),
        Owner: userId,
        ...JSON.parse(request.event.body),
    };

    const params = {
        TableName: tableName,
        Item: item,
        ReturnValues: 'NONE',
    };

    await dynamoDb.put(params).promise();
    return response.output(comment, 201);
}


const deleteComment = async (request, response) => {
    const params = {
        TableName: tableName,
        Key: {
            PK: request.pathVariables.docid,
            SK: `Comment#${request.pathVariables.commentid}`,
        },
    };

    await dynamoDb.delete(params).promise();
    return response.output({}, 204);
}


// ------------------------------------------------------------
// Lambda Router Handlers
// ------------------------------------------------------------

// Get all comments for a document
// GET /comments/(:docid)
router.add(
    Matcher.HttpApiV2('GET', '/comments/(:docid)'),
    validatePathVariables(schemas.getComments),
    getAllCommentsForDocument
);

// Create a new comment for a document
// POST /comments/(:docid)
router.add(
    Matcher.HttpApiV2('POST', '/comments/(:docid)'),
    validateBodyJSONVariables(schemas.createComment),
    createComment
);

// Deletes comment for a document
// POST /comments/(:docid)/(:commentid)
router.add(
    Matcher.HttpApiV2('DELETE', '/comments/(:docid)/(:commentid)'),
    validatePathVariables(schemas.deleteComment),
    deleteComment
);

// Lambda Handler
exports.handler = async (event, context) => {
    return router.run(event, context);
}
