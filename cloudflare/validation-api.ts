/**
 * WFSL Licence Engine — Proprietary Software
 * Copyright (c) Wynergy Fibre Solutions Ltd.
 * All rights reserved.
 *
 * This source code is licensed under the WFSL Proprietary Software Licence v1.0.
 * Unauthorised use, copying, modification, distribution, or hosting is prohibited.
 *
 * For licensing or commercial enquiries, contact:
 * legal@wynergy.co.uk
 */
export interface ValidationRequest {
  action: string;
  payload?: Record<string, unknown>;
}

export interface ValidationResponse {
  ok: boolean;
  message: string;
  data?: any;
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/health") {
        return Response.json({
          ok: true,
          service: "WFSL Validation API",
          timestamp: Date.now()
        });
      }

      if (url.pathname === "/validate" && request.method === "POST") {
        const body: ValidationRequest = await request.json();

        const response: ValidationResponse = {
          ok: true,
          message: "Validation received",
          data: {
            action: body.action,
            payload: body.payload ?? {}
          }
        };

        return Response.json(response);
      }

      return new Response("Validation API: Route not found", { status: 404 });

    } catch (err: any) {
      return Response.json(
        {
          ok: false,
          error: true,
          message: err?.message ?? "Validation engine error"
        },
        { status: 500 }
      );
    }
  }
};

