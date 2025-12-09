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
export interface FederationRequest {
  action: string;
  payload?: Record<string, unknown>;
}

export interface FederationResponse {
  ok: boolean;
  message: string;
  data?: any;
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Route: GET /federation/health
      if (url.pathname === "/federation/health") {
        return Response.json({
          ok: true,
          federation: true,
          timestamp: Date.now()
        });
      }

      // Route: POST /federation/dispatch
      if (url.pathname === "/federation/dispatch" && request.method === "POST") {
        const body: FederationRequest = await request.json();

        const response: FederationResponse = {
          ok: true,
          message: "Federation request processed",
          data: {
            action: body.action,
            received: body.payload ?? {}
          }
        };

        return Response.json(response);
      }

      // Unknown route
      return new Response("Federation API: Route not found", { status: 404 });

    } catch (err: any) {
      return Response.json(
        {
          ok: false,
          error: true,
          message: err?.message ?? "Unknown federation error"
        },
        { status: 500 }
      );
    }
  }
};

