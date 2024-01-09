import { Bucket, StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
    const bucket = new Bucket(stack, "Uploads", {
        cors: [
            {
                maxAge: "1 day",
                allowedOrigins: ["*"],
                allowedHeaders: ["*"],
                allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            },
        ],
    });
    // Create the DynamoDB table
    const products = new Table(stack, "Products4", {
        fields: {
            productId: "string",
            createdByUserId: "string",
            createdAt: "number",
            name: "string",
            brand: "string",
            category: "string",
            imageUrl: "string",
        },
        primaryIndex: { partitionKey: "productId" },
        globalIndexes: {
            userCreatedIndex: {
                partitionKey: 'createdByUserId',
                projection: ['name', 'brand', 'category', 'imageUrl'],

            },
            /* brandIndex: {
                partitionKey: 'brand',
                projection: ['name', 'category', 'imageUrl'],
            } */
        }
    });


    return {
        bucket, products,
    };
}