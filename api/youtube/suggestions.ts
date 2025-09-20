export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Manejar preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Solo permitir GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // URL de tu API externa para sugerencias
    const apiUrl = `https://shrill-snowflake-ecac.alvarez23.workers.dev/api/suggestions?query=${encodeURIComponent(
      query
    )}`;

    console.log("💡 Getting suggestions for:", query);
    console.log("📡 Calling API:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "KantoBar-Karaoke/1.0",
      },
    });

    if (!response.ok) {
      console.error("❌ API Error:", response.status, response.statusText);
      return res.status(response.status).json({
        error: `API request failed: ${response.status} ${response.statusText}`,
        success: false,
      });
    }

    const data = await response.json();

    console.log("✅ Suggestions received:", {
      success: data.success,
      suggestionsCount: data.data?.length || 0,
    });

    // Retornar la respuesta tal como la recibimos
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      success: false,
    });
  }
}
