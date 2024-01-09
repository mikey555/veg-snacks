import { Table } from "sst/node/table";
import handler from "@veg-snacks/core/handler";
import dynamoDb from "@veg-snacks/core/dynamodb";

export const main = handler(async (event) => {
    let data = {
        name: "",
        brand: "",
        category: "",
        attachment: "",
    };

    data = JSON.parse(event.body || "{}");

    const params = {
        TableName: Table.Products4.tableName,
        Key: {
            // The attributes of the item to be created
            productId: event?.pathParameters?.id, // The id of the note from the path
            userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,

        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: "SET name = :name, attachment = :attachment, \
                            brand = :brand, category = :category",
        ExpressionAttributeValues: {
            ":attachment": data.attachment || null,
            ":name": data.name || null,
            ":brand": data.brand || null,
            ":category": data.category || null,
        },
        // 'ReturnValues' specifies if and how to return the item's attributes,
        // where ALL_NEW returns all attributes of the item after the update; you
        // can inspect 'result' below to see how it works with different settings
        ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params);

    return JSON.stringify({ status: true });
});