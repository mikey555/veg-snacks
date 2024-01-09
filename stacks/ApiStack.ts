import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
    const { products } = use(StorageStack);
    const STRIPE_SECRET_KEY = new Config.Secret(stack, "STRIPE_SECRET_KEY");

    // Create the API
    const api = new Api(stack, "Api", {
        cors: true,
        defaults: {
            authorizer: "iam",
            function: {
                bind: [products, STRIPE_SECRET_KEY],
            },
        },
        routes: {
            "GET /products": "packages/functions/src/list.main",
            "POST /products": "packages/functions/src/create.main",
            "GET /products/{id}": "packages/functions/src/get.main",
            "PUT /products/{id}": "packages/functions/src/update.main",
            "DELETE /products/{id}": "packages/functions/src/delete.main",
            "POST /billing": "packages/functions/src/billing.main",
        },
    });

    // Show the API endpoint in the output
    stack.addOutputs({
        ApiEndpoint: api.url,
    });

    // Return the API resource
    return {
        api,
    };
}