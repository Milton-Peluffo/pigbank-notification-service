import { SQSEvent } from "aws-lambda";
/**
 * Lambda handler to process failed messages from DLQ
 * Saves error information for auditing
 */
export declare const handler: (event: SQSEvent) => Promise<void>;
//# sourceMappingURL=send-notifications-error.handler.d.ts.map