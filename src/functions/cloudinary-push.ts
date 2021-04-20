import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import got from 'got'

import { CloudinaryIntegrationFieldsPayload } from '../shared'

const PRISMIC_IF_WRITE_CLOUDINARY_URL =
  process.env.PRISMIC_IF_WRITE_CLOUDINARY_URL
const PRISMIC_IF_WRITE_TOKEN = process.env.PRISMIC_IF_WRITE_TOKEN

interface CloudinaryNotification {
  notification_type: string
}

interface CloudinaryUploadSimpleNotification extends CloudinaryNotification {
  notification_type: 'upload'
  timestamp: string
  request_id: string
  asset_id: string
  public_id: string
  version: number
  version_id: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  original_filename: string
}

const isCloudinaryNotification = (
  notification: unknown,
): notification is CloudinaryUploadSimpleNotification =>
  typeof notification === 'object' &&
  notification !== null &&
  'notification_type' in notification

const isCloudinaryUploadSimpleNotification = (
  notification: CloudinaryNotification,
): notification is CloudinaryUploadSimpleNotification =>
  notification.notification_type === 'upload'

export const handler = async function (
  event: APIGatewayEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> {
  if (typeof PRISMIC_IF_WRITE_CLOUDINARY_URL !== 'string') {
    throw new Error('PRISMIC_IF_WRITE_CLOUDINARY_URL not defined')
  }

  if (typeof PRISMIC_IF_WRITE_TOKEN !== 'string') {
    throw new Error('PRISMIC_IF_WRITE_TOKEN not defined')
  }

  const notification = JSON.parse(event.body || '{}')

  if (isCloudinaryNotification(notification)) {
    if (isCloudinaryUploadSimpleNotification(notification)) {
      try {
        const integrationFieldsPayload: CloudinaryIntegrationFieldsPayload = {
          id: notification.asset_id,
          title: notification.public_id,
          description: `${notification.width}x${notification.height}`,
          image_url: notification.url,
          last_update: new Date(notification.created_at).getTime(),
          blob: { ...notification },
        }

        await got.post(PRISMIC_IF_WRITE_CLOUDINARY_URL, {
          headers: {
            Authorization: `Bearer ${PRISMIC_IF_WRITE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          json: [integrationFieldsPayload],
        })

        return { statusCode: 200, body: '' }
      } catch (error) {
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: (error as Error).message }),
        }
      }
    } else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: `Supported notification type: ${notification}`,
        }),
      }
    }
  } else {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Unsupported payload',
      }),
    }
  }
}
