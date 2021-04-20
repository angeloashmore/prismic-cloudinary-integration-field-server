import { ResourceApiResponse } from 'cloudinary'
import { IterableElement } from 'type-fest'

export interface PrismicIntegrationFieldsApiResponse<TResult> {
  results_size: number
  results: TResult[]
}

export type CloudinaryResource = IterableElement<
  ResourceApiResponse['resources']
>

export interface CloudinaryIntegrationFieldsPayload {
  id: string
  title: string
  description: string
  image_url: string
  last_update: number
  blob: Record<string | number, unknown>
}

export const dateStringComparitor = (a: string, b: string) =>
  new Date(b).getTime() - new Date(a).getTime()

export const cloudinaryResourceToPrismicPayload = (
  resource: CloudinaryResource,
): CloudinaryIntegrationFieldsPayload => ({
  id: resource.asset_id,
  title: resource.public_id,
  description: `${resource.width}x${resource.height}`,
  image_url: resource.url,
  last_update: new Date(resource.created_at).getTime(),
  blob: resource,
})
