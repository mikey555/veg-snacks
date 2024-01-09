import { Table } from "sst/node/table";
import handler from "@veg-snacks/core/handler";
import dynamoDb from "@veg-snacks/core/dynamodb";

export const main = handler(async (event) => {
    const params = {
        TableName: Table.Products4.tableName,
        // 'Key' defines the partition key and sort key of
        // the item to be retrieved
        Key: {
            productId: event?.pathParameters?.id,
        },
    };

    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }

    // Return the retrieved item
    return JSON.stringify(result.Item);
});