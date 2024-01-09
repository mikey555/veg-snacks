import * as uuid from "uuid";
import { Table } from "sst/node/table";
import handler from '@veg-snacks/core/handler';
import dynamoDb from '@veg-snacks/core/dynamodb';

export const main = handler(async (event) => {
    let data = {
        name: "",
        brand: "",
        category: "",
    };

    if (event.body != null) {
        data = JSON.parse(event.body);
    }

    const params = {
        TableName: Table.Products4.tableName,
        Item: {
            userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
            productId: uuid.v1(), // A unique uuid
            name: data.name,
            brand: data.brand,
            category: data.category,
            imageUrl: 'https://testUrl.com',
            createdAt: Date.now(), // Current Unix timestamp


        },
    };

    await dynamoDb.put(params);

    return JSON.stringify(params.Item);
});