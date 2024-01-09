import { Table } from "sst/node/table";
import handler from "@veg-snacks/core/handler";
import dynamoDb from "@veg-snacks/core/dynamodb";

export const main = handler(async (event) => {
    const params = {
        TableName: Table.Products4.tableName,
        Key: {
            productId: event?.pathParameters?.id, // The id of the note from the path
        },
    };

    await dynamoDb.delete(params);

    return JSON.stringify({ status: true });
});