import { connect } from 'cloudflare:sockets';
import { DurableObject } from 'cloudflare:workers';

const BLOCKED_SUFFIXES = new Set([
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'google-analytics.com',
  'googletagmanager.com', 'googletagservices.com', 'admob.com', 'ads.google.com',
  'adnxs.com', 'adsrvr.org', 'rubiconproject.com', 'pubmatic.com', 'openx.net',
  'criteo.com', 'taboola.com', 'outbrain.com', 'quantserve.com', 'scorecardresearch.com',
  'facebook.net', 'facebook.com', 'fbcdn.net', 'connect.facebook.net', 'pixel.facebook.com',
  'ads.twitter.com', 'analytics.twitter.com', 't.co', 'ads.linkedin.com', 'ads.pinterest.com',
  'telemetry.microsoft.com', 'vortex.data.microsoft.com', 'settings-win.data.microsoft.com',
  'hotjar.com', 'mixpanel.com', 'segment.io', 'amplitude.com', 'fullstory.com'
]);

function generateUUIDv7() {
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16).padStart(12, '0');
  const randBytes = new Uint8Array(10);
  crypto.getRandomValues(randBytes);
  randBytes[0] = (randBytes[0] & 0x0f) | 0x70; 
  randBytes[2] = (randBytes[2] & 0x3f) | 0x80; 
  const hex = Array.from(randBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8)}`;
}

function isDomainBlocked(domain) {
  if (!domain) return false;
  const lowerDomain = domain.toLowerCase();
  for (const suffix of BLOCKED_SUFFIXES) {
    if (lowerDomain === suffix || lowerDomain.endsWith('.' + suffix)) return true;
  }
  return false;
}

function extractDomainFromQuery(buffer) {
  try {
    let offset = 12; 
    let parts = [];
    while (offset < buffer.length) {
      let len = buffer[offset];
      if (len === 0) break; 
      offset++;
      let label = new TextDecoder().decode(buffer.subarray(offset, offset + len));
      parts.push(label);
      offset += len;
    }
    return parts.join('.');
  } catch (e) {
    return null;
  }
}

function createBlockedResponse(queryBuffer) {
  const res = Buffer.from(queryBuffer);
  res[2] |= 0x80; 
  res[3] = (res[3] & 0xF0) | 0x03; 
  res[4] = 0; res[5] = 0; 
  res[6] = 0; res[7] = 0;
  res[8] = 0; res[9] = 0;
  res[10] = 0; res[11] = 0;
  return res.subarray(0, 12);
}

async function handleDnsQuery(request) {
  try {
    const queryArrayBuffer = await request.arrayBuffer();
    const queryBuffer = Buffer.from(queryArrayBuffer);

    if (queryBuffer.length < 12) {
      return new Response('Bad Request', { status: 400 });
    }

    const targetDomain = extractDomainFromQuery(queryBuffer);
    
    if (isDomainBlocked(targetDomain)) {
      const blockedResp = createBlockedResponse(queryBuffer);
      return new Response(blockedResp, {
        headers: {
          'Content-Type': 'application/dns-message',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const len = queryBuffer.length;
    const tcpPacket = Buffer.alloc(2 + len);
    tcpPacket.writeUInt16BE(len, 0);
    queryBuffer.copy(tcpPacket, 2);

    const socket = connect({ hostname: '9.9.9.9', port: 53 });
    const writer = socket.writable.getWriter();
    await writer.write(tcpPacket);
    writer.releaseLock();

    const reader = socket.readable.getReader();
    let chunks = [];
    let totalLength = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }

    socket.close();

    const responseTcpPacket = Buffer.concat(chunks, totalLength);
    const dnsResponseBuffer = responseTcpPacket.subarray(2);

    return new Response(dnsResponseBuffer, {
      headers: {
        'Content-Type': 'application/dns-message',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': dnsResponseBuffer.length.toString()
      }
    });
  } catch (err) {
    return new Response('Bad Gateway', { status: 502 });
  }
}

// Durable Object responsável por centralizar o WebSocket e os Webhooks de um UUID específico
export class WebhookHub extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);

    // Conexão WebSocket em tempo real
    if (url.pathname.endsWith('/ws')) {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    // Recebimento do Webhook (POST/GET)
    if (url.pathname.endsWith('/trigger')) {
      let bodyText = '';
      try {
        bodyText = await request.text();
      } catch (e) {
        bodyText = '[Body vazio ou binário]';
      }

      const headersObj = {};
      for (let [key, val] of request.headers.entries()) {
        headersObj[key] = val;
      }

      const logPayload = {
        ip: request.headers.get('cf-connecting-ip') || '127.0.0.1',
        country: request.headers.get('cf-ipcountry') || 'XX',
        date: new Date().toLocaleString('pt-BR'),
        headers: headersObj,
        body: bodyText
      };

      // Dispara a mensagem para todos os navegadores conectados neste DO
      const sockets = this.ctx.getWebSockets();
      const message = JSON.stringify(logPayload);
      for (const ws of sockets) {
        try {
          ws.send(message);
        } catch (err) {}
      }

      return new Response(JSON.stringify({ status: 'success', message: 'Webhook processado com Durable Object' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  async webSocketMessage(ws, message) {}
  async webSocketClose(ws, code, reason, wasClean) {}
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // DoH na Raiz
    if (path === '/' || path === '') {
      if (request.method === 'POST' || url.searchParams.has('dns')) {
        return handleDnsQuery(request);
      }
      return new Response(JSON.stringify({ 
        service: 'NodeDoH-ApexShield-DO',
        status: 'online',
        panel: '/paniel/'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (path === '/dns-query' && request.method === 'POST') {
      return handleDnsQuery(request);
    }

    // Painel Principal de Criação
    if (path === '/paniel/') {
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>NodeDoH - Painel de Webhooks Apex</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    h1 { color: #38bdf8; margin-top: 0; }
    button { background: #0ea5e9; color: white; border: none; padding: 12px 24px; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #0284c7; }
    .list { margin-top: 20px; }
    .item { background: #334155; padding: 15px; border-radius: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    a { color: #38bdf8; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Painel de Webhooks - NodeDoH</h1>
    <p>Gere endpoints dinâmicos protegidos com UUID v7 baseados em Durable Objects.</p>
    <button onclick="createWebhook()">Criar Webhook</button>
    <div class="list" id="webhookList"></div>
  </div>
  <script>
    let webhooks = JSON.parse(localStorage.getItem('node_apex_webhooks') || '[]');
    function render() {
      const container = document.getElementById('webhookList');
      if (webhooks.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8;">Nenhum webhook criado ainda.</p>';
        return;
      }
      container.innerHTML = webhooks.map(uuid => 
        '<div class="item"><span>UUID: <strong>' + uuid + '</strong></span><div><a href="/webhook/' + uuid + '" target="_blank" style="margin-right: 15px;">Endpoint</a><a href="/webhook/' + uuid + '/paniel" target="_blank">Abrir Painel</a></div></div>'
      ).join('');
    }
    async function createWebhook() {
      const res = await fetch('/api/webhook/create', { method: 'POST' });
      const data = await res.json();
      webhooks.push(data.uuid);
      localStorage.setItem('node_apex_webhooks', JSON.stringify(webhooks));
      render();
    }
    render();
  </script>
</body>
</html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path === '/api/webhook/create' && request.method === 'POST') {
      const newUuid = generateUUIDv7();
      return new Response(JSON.stringify({ uuid: newUuid }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Painel Individual / Roteamento Durable Object
    if (path.startsWith('/webhook/')) {
      const parts = path.split('/');
      const uuid = parts[2];
      if (!uuid) return new Response('Not Found', { status: 404 });

      // Roteia para o Durable Object correspondente ao UUID do Webhook
      const id = env.WEBHOOK_DO.idFromName(uuid);
      const stub = env.WEBHOOK_DO.get(id);

      // Se for o painel HTML individual
      if (path.endsWith('/paniel')) {
        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Painel Webhook - ${uuid}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; margin: 0; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #38bdf8; font-size: 22px; }
    .endpoint-box { background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-family: monospace; color: #34d399; }
    .log-card { background: #1e293b; border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .log-header { display: flex; justify-content: space-between; color: #94a3b8; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #334155; padding-bottom: 5px; }
    pre { background: #0f172a; padding: 10px; border-radius: 6px; overflow-x: auto; color: #f472b6; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Painel em Tempo Real: ${uuid}</h1>
    <div class="endpoint-box">URL do Endpoint: https://${url.host}/webhook/${uuid}</div>
    <h3>Requisições Recebidas</h3>
    <div id="logsContainer"><p style="color: #94a3b8;">Aguardando requisições em tempo real via WebSocket...</p></div>
  </div>
  <script>
    const uuid = "${uuid}";
    let db;
    
    const requestDB = indexedDB.open("NodeApexWebhooksDB", 1);
    requestDB.onupgradeneeded = e => {
      db = e.target.result;
      if (!db.objectStoreNames.contains("logs")) {
        db.createObjectStore("logs", { keyPath: "id", autoIncrement: true });
      }
    };
    requestDB.onsuccess = e => {
      db = e.target.result;
      loadLogsFromIDB();
    };

    function saveToIDB(logData) {
      if (!db) return;
      const tx = db.transaction("logs", "readwrite");
      const store = tx.objectStore("logs");
      store.add({ uuid, ...logData, localSavedAt: Date.now() });
    }

    function loadLogsFromIDB() {
      if (!db) return;
      const tx = db.transaction("logs", "readonly");
      const store = tx.objectStore("logs");
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.filter(l => l.uuid === uuid);
        if (results.length > 0) {
          document.getElementById('logsContainer').innerHTML = results.reverse().map(renderLogHTML).join('');
        }
      };
    }

    function renderLogHTML(log) {
      return '<div class="log-card">' +
        '<div class="log-header"><span><strong>IP:</strong> ' + log.ip + ' | <strong>País:</strong> ' + log.country + '</span><span>' + log.date + '</span></div>' +
        '<p><strong>Headers:</strong></p><pre>' + JSON.stringify(log.headers, null, 2) + '</pre>' +
        '<p style="margin-top: 10px;"><strong>Body:</strong></p><pre>' + log.body + '</pre>' +
      '</div>';
    }

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(protocol + '//' + location.host + '/webhook/' + uuid + '/ws');
    
    ws.onmessage = event => {
      const log = JSON.parse(event.data);
      saveToIDB(log);
      const container = document.getElementById('logsContainer');
      if (container.innerHTML.includes('Aguardando requisições')) {
        container.innerHTML = '';
      }
      container.insertAdjacentHTML('afterbegin', renderLogHTML(log));
    };
  </script>
</body>
</html>`;
        return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
      }

      // Encaminha a requisição do WebSocket ou do Webhook para o Durable Object
      const subPath = path.endsWith('/ws') ? '/ws' : '/trigger';
      const doUrl = new URL(request.url);
      doUrl.pathname = subPath;
      
      return stub.fetch(new Request(doUrl, request));
    }

    if (path === '/healthz') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        engine: 'NodeDoH-HyperApexShield-DurableObjects'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
