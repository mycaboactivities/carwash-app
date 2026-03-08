const CLIP_API_URL = 'https://api.payclip.com/v2/checkout';

function getAuthHeader(): string {
  const apiKey = process.env.CLIP_API_KEY!;
  const apiSecret = process.env.CLIP_API_SECRET!;
  return 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
}

interface ClipCheckoutParams {
  amount: number;
  description: string;
  successUrl: string;
  errorUrl: string;
  defaultUrl: string;
  webhookUrl: string;
  externalReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  expiresAt?: string;
}

interface ClipCheckoutResponse {
  payment_request_id: string;
  object_type: string;
  status: string;
  payment_request_url: string;
  qr_image_url: string;
  created_at: string;
  api_version: string;
}

export async function createClipCheckout(params: ClipCheckoutParams): Promise<ClipCheckoutResponse> {
  const response = await fetch(CLIP_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: 'MXN',
      purchase_description: params.description,
      redirection_url: {
        success: params.successUrl,
        error: params.errorUrl,
        default: params.defaultUrl,
      },
      webhook_url: params.webhookUrl,
      override_settings: {
        tip_enabled: false,
      },
      metadata: {
        external_reference: params.externalReference,
        customer_info: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
        },
      },
      ...(params.expiresAt && { expires_at: params.expiresAt }),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Clip API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}
