import { Handler } from "@netlify/functions";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMO_TABLE;

export const handler: Handler = async () => {
  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const items = result.Items ?? [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(items),
    };
  } catch (error) {
    console.error("DynamoDB fetch failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch content",
      }),
    };
  }
};