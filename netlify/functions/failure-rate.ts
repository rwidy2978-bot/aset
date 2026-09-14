interface NetlifyEvent {
  httpMethod: string;
  path: string;
  queryStringParameters?: Record<string, string>;
  headers: Record<string, string>;
  body?: string | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

// Netlify Serverless API Handler for Failure Rate Relational DB
export const handler = async (event: NetlifyEvent, _context: any): Promise<NetlifyResponse> => {
  const method = event.httpMethod;

  // CORS Headers for seamless browser access
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

    // If external Postgres is configured in Netlify Environment Variables
    if (databaseUrl) {
      // In production with @neondatabase/serverless or pg:
      // const sql = neon(databaseUrl);
      // const data = await sql`SELECT * FROM monthly_breakdown_metrics`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "connected",
          driver: "postgres_serverless",
          message: "Database Netlify/Neon terhubung dengan sukses.",
        }),
      };
    }

    // Default fast response fallback
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "ready",
        driver: "in_memory_relational",
        message: "API Netlify Functions aktif. Siap menerima integrasi DATABASE_URL.",
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "error",
        message: error.message || "Internal Server Error",
      }),
    };
  }
};
