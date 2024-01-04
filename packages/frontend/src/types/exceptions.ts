import { z } from 'zod';

export const CognitoExceptionSchema = z.object({
    code: z.string(),
    name: z.string(),
    message: z.string(),
    stack: z.string(),
});