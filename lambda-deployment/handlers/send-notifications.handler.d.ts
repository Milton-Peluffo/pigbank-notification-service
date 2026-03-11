import { SQSEvent, SQSBatchResponse } from "aws-lambda";
/**
 * Main Lambda handler to process notifications
 * Receives SQS queue events, sends emails and saves to DynamoDB
 */
export declare const handler: (event: SQSEvent) => Promise<SQSBatchResponse>;
//# sourceMappingURL=send-notifications.handler.d.ts.map