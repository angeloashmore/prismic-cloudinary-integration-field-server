import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { ResourceApiResponse, v2 as cloudinary } from 'cloudinary'

import {
  CloudinaryIntegrationFieldsPayload,
  cloudinaryResourceToPrismicPayload,
  dateStringComparitor,
  PrismicIntegrationFieldsApiResponse,
} from '../shared'

export const handler = async function (
  _event: APIGatewayEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> {
  // TODO: Support pagination
  const resourcesResponse = (await cloudinary.api.resources({
    max_results: 50,
  })) as ResourceApiResponse

  const results = resourcesResponse.resources
    .sort((a, b) => dateStringComparitor(a.created_at, b.created_at))
    .map((resource) => cloudinaryResourceToPrismicPayload(resource))

  const rawBody: PrismicIntegrationFieldsApiResponse<CloudinaryIntegrationFieldsPayload> = {
    results_size: results.length,
    results,
  }
  const body = JSON.stringify(rawBody)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }
}
