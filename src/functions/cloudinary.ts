import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { ResourceApiResponse, v2 as cloudinary } from 'cloudinary'
import { IterableElement } from 'type-fest'

interface PrismicIntegrationFieldsApiResponse<TResult> {
  results_size: number
  results: TResult[]
}

interface CloudinaryIntegrationFieldsPayload {
  id: string
  title: string
  description: string
  image_url: string
  last_update: number
  blob: Record<string | number, unknown>
}

const dateStringComparitor = (a: string, b: string) =>
  new Date(b).getTime() - new Date(a).getTime()

const cloudinaryResourceToPrismicPayload = (
  resource: IterableElement<ResourceApiResponse['resources']>,
): CloudinaryIntegrationFieldsPayload => ({
  id: resource.asset_id,
  title: resource.public_id,
  description: `${resource.width}x${resource.height}`,
  image_url: resource.url,
  last_update: new Date(resource.created_at).getTime(),
  blob: resource,
})

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
