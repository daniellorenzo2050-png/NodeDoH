export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Se a requisição usar o método CONNECT (túnel HTTPS/TLS)
    if (request.method === "CONNECT") {
      return new Response("CONNECT method not supported directly in standard HTTP Workers fetch handler. Use TCP socket bindings if applicable.", { 
        status: 405 
      });
    }

    // Para requisições HTTP normais no Forward Proxy
    try {
      const targetUrl = url.searchParams.get("url") || url.href;
      
      // Repassa a requisição mantendo os headers originais
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "follow"
      });

      const response = await fetch(modifiedRequest);
      return response;
    } catch (err) {
      return new Response(`[NodeProxy Edge Error]: ${err.message}`, { status: 502 });
    }
  }
};
