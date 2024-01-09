import { Table } from "sst/node/table";
import handler from "@veg-snacks/core/handler";
import dynamoDb from "@veg-snacks/core/dynamodb";

export const main = handler(async (event) => {
    let params = {
        TableName: Table.Products4.tableName,
        /* KeyConditionExpression: "brand = :brand",
        ExpressionAttributeValues: {
            ":brand": event?.pathParameters?.brand,
        }, */
        Limit: 10
    };

    /* let data = [];
    let lastEvaluatedKey = null;

    do {
        params.ExclusiveStartKey = lastEvaluatedKey;

        const results = await dynamoDb.scan(params);
        data = data.concat(results.Items);
        lastEvaluatedKey = results.LastEvaluatedKey;
    } while (lastEvaluatedKey); */

    // const result = await dynamoDb.query(params);
    const result = await dynamoDb.scan(params);


    // Return the matching list of items in response body
    return JSON.stringify(result.Items);
});