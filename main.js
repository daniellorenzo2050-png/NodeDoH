import { connect } from 'cloudflare:sockets';

// Base hiper-massiva de nível Apex com expansão máxima para SDKs de anúncios mobile, telemetria regional asiática/europeia, plataformas de rastreamento avançado e infraestrutura de ameaças
const BLOCKED_SUFFIXES = new Set([
  // Google Ads, AdMob, Analytics, TagManager & Telemetria Core
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'google-analytics.com',
  'googletagmanager.com', 'googletagservices.com', 'admob.com', 'ads.google.com',
  'pagead2.googlesyndication.com', 'tpc.googlesyndication.com', 'adservice.google.com',
  'analytics.google.com', 'clickserve.dartsearch.net', 'adclick.g.doubleclick.net',
  'google-analytics.analytics.google.com', 'stats.g.doubleclick.net', 'tagmanager.google.com',
  'adservice.google.com.br', 'googleadservices.com.br', 'google-analytics.com.br',
  'googleadservices.com.hk', 'googleadservices.com.jp', 'googleadservices.co.uk',
  'google-analytics.es', 'google-analytics.fr', 'google-analytics.it', 'google-analytics.de',
  'googleadservices.com.au', 'googleadservices.com.mx', 'googleadservices.ca',
  'googleadservices.com.ar', 'googleadservices.com.co', 'googleadservices.cl',
  'googleadservices.com.tr', 'googleadservices.com.vn', 'googleadservices.co.in',
  'googleadservices.com.ph', 'googleadservices.com.pk', 'googleadservices.com.ng',
  'googleadservices.com.eg', 'googleadservices.com.ua', 'googleadservices.be',
  'googleadservices.com.pl', 'googleadservices.gr', 'googleadservices.ro', 'googleadservices.pt',

  // Redes de Anúncios, SSPs, DSPs e RTB Globais, Regionais e Mobile SDKs
  'adnxs.com', 'adsrvr.org', 'rubiconproject.com', 'pubmatic.com', 'openx.net',
  'criteo.com', 'taboola.com', 'outbrain.com', 'quantserve.com', 'scorecardresearch.com',
  'moatads.com', 'mopub.com', 'unityads.unity3d.com', 'vungle.com', 'applovin.com',
  'chartboost.com', 'inmobi.com', 'yieldmanager.com', 'adform.net', 'exoclick.com',
  'propellerads.com', 'trafficjunky.net', 'tsyndicate.com', 'adsterra.com',
  'adkernel.com', 'adcolony.com', 'inmobi.cn', 'smaato.com', 'avazutracking.net',
  'clickioclick.com', 'popads.net', 'popcash.net', 'eroadvertising.com', 'revcontent.com',
  'adhigh.net', 'adhood.com', 'adpepper.com', 'adtegrity.net', 'advertising.com',
  'adtegrity.com', 'adtoma.com', 'adserver.com', 'adserver.yahoo.com', 'adserver.rtb.com',
  'bidswitch.net', 'lkqd.net', 'spotxchange.com', 'lijit.com', 'contextweb.com',
  'sonobi.com', 'districtm.io', 'sharethrough.com', 'triplelift.com', 'sovrn.com',
  'adlooxtracking.com', 'adlightning.com', 'adsafeprotected.com', 'ampproject.net',
  'casalemedia.com', 'criteo.net', 'demdex.net', 'eyereturn.com', 'imrworldwide.com',
  'mookie1.com', 'omtrdc.net', 'quantcount.com', 'realtime-bid.com', 'revsci.net',
  'tynt.com', 'vidazoo.com', 'yumenetworks.com', 'ad-score.com', 'adkernel.ru',
  'admanmedia.com', 'adgoal.de', 'adcell.de', 'admitad.com', 'admarketplace.com',
  'adkernel.org', 'adsafeprotected.co.uk', 'adserver.adtech.de', 'adscale.de',
  'adserver.kliken.com', 'ads.yandex.ru', 'an.yandex.ru', 'metrika.yandex.ru',
  'adfox.ru', 'direct.yandex.ru', 'awaps.yandex.net', 'yandex.ru/metrika',
  'adserver.one', 'adthrive.com', 'mediavine.com', 'shemedia.com', 'cafemedia.com',
  'ironsrc.com', 'supersonicads.com', 'mintegral.com', 'pangle.io', 'pangleglobal.com',

  // Redes Sociais, Pixels, Ferramentas de Engajamento e Rastreadores de Perfil
  'facebook.net', 'facebook.com', 'fbcdn.net', 'connect.facebook.net', 'pixel.facebook.com',
  'ads.twitter.com', 'analytics.twitter.com', 't.co', 'ads.linkedin.com', 'ads.pinterest.com',
  'ads.tiktok.com', 'analytics.tiktok.com', 'ads.reddit.com', 'ads.snapchat.com',
  'tr.snapchat.com', 'analytics.yahoo.com', 'ads.yahoo.com', 'analytics.tumblr.com',
  'ads.instagram.com', 'graph.instagram.com', 'tracking.kakaoweb.com', 'ads.weibo.com',
  'ads-twitter.com', 'analytics-twitter.com', 'ads.pinadmin.com', 'ads.facebook.com',
  'pixel.reddit.com', 'ads.line-scdn.net', 'tr.line.me', 'vk-analytics.com',
  'analytics.pinterest.com', 'ads-api.twitter.com', 'ads.tiktok.com.v-s.mobi',
  'graph.facebook.com', 'connect.facebook.com', 'an.facebook.com', 'pixel.instagram.com',
  'ads.telegram.org', 'analytics.telegram.org', 'ads.discord.com', 'tracking.vk.com',
  'ads.qq.com', 'ads.wechat.com', 'analytics.snapchat.com', 'ads-fa.facebook.com',
  'analytics.tiktok.com.v-s.mobi', 'ads.twitch.tv', 'collector.twitch.tv',
  'ads.pinterest.co.kr', 'ads.line.me', 'track.discord.com', 'metrics.discord.gg',
  'ads.snapchat.com.v-s.mobi', 'ads.linkedin.com.v-s.mobi', 'analytics.line.me',
  'ads.bilibili.com', 'stats.vk.com', 'ads.naver.com', 'analytics.naver.com',

  // Telemetria Corporativa, OS Engines, Assistentes e Smart TVs
  'telemetry.microsoft.com', 'vortex.data.microsoft.com', 'settings-win.data.microsoft.com',
  'radars.msft.com', 'activation.sl.dl.delivery.mp.microsoft.com', 'diagnostics.support.microsoft.com',
  'ceipmsn.msn.com', 'feedback.microsoft-hohm.com', 'watson.telemetry.microsoft.com',
  'fe3.delivery.mp.microsoft.com', 'tlu.dl.delivery.mp.microsoft.com', 'sls.update.microsoft.com',
  'iadsdk.apple.com', 'metrics.apple.com', 'analytics.apple.com', 'diagnostic.apple.com',
  'xp.apple.com', 'guzzoni.apple.com', 'init-p01.push.apple.com', 'metrics.icloud.com',
  'samsungads.com', 'samsungcloudplatform.com', 'config.samsungads.com', 'track.samsungcloudplatform.com',
  'lgsmartad.com', 'data.samsung.com', 'samsungosp.com', 'tracking.miui.com', 'metrics.data.hikarimail.ne.jp',
  'samsung-analytics.com', 'samsungacr.com', 'tv.samsungads.com', 'log-config.samsungcloudplatform.com',
  'samsungcloud.com', 'samsungqbe.com', 'ads.samsung.com', 'tracking.lge.com', 'smartshare.lge.com',
  'data.microsoft.com', 'feedback.windows.com', 'telemetry.samsungcloudplatform.com',
  'bingspn.com', 'msedge.net', 'fe3.update.microsoft.com.akadns.net', 'vortex-win.data.microsoft.com',
  'telemetry.trust.sec.samsung.net', 'samsung-com.112.2o7.net', 'samsungosp.com.akadns.net',
  'tracking.roku.com', 'cooper.logs.roku.com', 'scribe.logs.roku.com', 'cloud.roku.com',
  'vortex.data.microsoft.com.akadns.net', 'settings-win.data.microsoft.com.akadns.net',
  'samsungcloud.tv', 'config.tcl.com', 'ad.tcl.com', 'api.tcl.com', 'android.clients.google.com',
  'logger.amazon.com', 'unagi-na.amazon.com', 'device-metrics-us.amazon.com', 'api.amazon.com/device/metrics',
  'samsungcloud.net', 'lgsmartads.com', 'tracking.vizio.com', 'collector.vizio.com',
  'samsungcloud.com.cn', 'sdk.update.avast.com', 'telemetry.malwarebytes.com',

  // Plataformas de Métricas Web, Heatmaps, Analytics Avançados e Gravação de Sessão
  'hotjar.com', 'mixpanel.com', 'segment.io', 'amplitude.com', 'fullstory.com',
  'newrelic.com', 'nr-data.net', 'sentry.io', 'bugsnag.com', 'raygun.io', 'intercom.io',
  'optimizely.com', 'kissmetrics.com', 'quantcast.com', 'scorecardresearch.com',
  'mouseflow.com', 'luckyorange.com', 'inspector.dev', 'logrocket.com', 'branch.io',
  'heapanalytics.com', 'mixpanel.org', 'statcounter.com', 'histats.com', 'clicky.com',
  'api.mixpanel.com', 'cdn.jsdelivr.net/npm/@hotjar', 'widget.intercom.io', 'js.hs-scripts.com',
  'js.usemessages.com', 'track.hubspot.com', 'forms.hubspot.com', 'api.segment.io',
  'clarity.ms', 'c.clarity.ms', 'bat.bing.com', 'analytics.google.ru', 'stat.onlineweb.com',
  'inspectlet.com', 'userzoom.com', 'usabilla.com', 'contentsquare.net', 'loggly.com',
  'vwo.com', 'abtasty.com', 'crazyegg.com', 'sessioncam.com', 'smartlook.com',
  'api.amplitude.com', 'cdn.segment.com', 'app.link', 'branch.io-api.com',
  'ping.chartbeat.net', 'static.chartbeat.com', 'collector.github.com', 'collector.launchdarkly.com',
  'api.mixpanel.com', 'events.mapbox.com', 'telemetry.eu.org', 'logs.ovh.net',
  'datadog-analytics.com', 'browser-intake-datadoghq.com', 'instrumental.io', 'rollbar.com',
  'pingdom.net', 'loggly.com', 'sumologic.com', 'instana.io', 'dynatrace.com',

  // Botnets, C2, Malware, Phishing, Ransomware, Exploit Kits e Exfiltração de Dados
  'malware.hacker-c2.org', 'telemetry.bad-actor.io', 'phishing-verify-bank.com',
  'secure-login-update-account.net', 'free-crypto-giveaway.org', 'c2-server-botnet.ru',
  'ransomware-decrypt-portal.xyz', 'trojan-download-hub.cc', 'stealer-log-collector.net',
  'dns-tunnel-exfil.org', 'malicious-payload-drop.info', 'fake-update-browser.biz',
  'express-delivery-fraud.com', 'credential-harvest-site.org', 'exploit-kit-landing.net',
  'zero-day-delivery.xyz', 'malicious-redirect-hub.com', 'click-fraud-botnet.org',
  'crypto-miner-inject.cc', 'ransom-note-host.net', 'botnet-command-control.info',
  'apt-group-exfiltration.net', 'ddos-reflection-node.xyz', 'spam-gateway-relay.com',
  'malvertising-network-hub.org', 'fake-antivirus-scan.net', 'tech-support-scam-alert.com',
  'lottery-winner-fraud.org', 'tax-refund-phishing.net', 'delivery-failed-parcel.xyz',
  'social-engineering-hook.com', 'waterhole-attack-host.org', 'dns-spoofing-target.net',
  'malicious-payload-delivery.net', 'stealer-exfil-endpoint.ru', 'ransomware-payment-portal.cc',
  'phishing-credential-harvest.net', 'c2-infrastructure-node.xyz', 'exploit-delivery-hub.org',
  'malware-dropzone-server.net', 'botnet-relay-node.info', 'trojan-update-server.biz',
  'dns-tunneling-gateway.org', 'cryptominer-pool-inject.net', 'fake-bank-login-secure.com',
  'malicious-dropper-v2.xyz', 'apt29-command-node.org', 'cobalt-strike-beacon-handler.net',
  'ransomware-key-server.cc', 'phishing-login-portal-01.com', 'phishing-login-portal-02.net',
  'credential-stealer-core.xyz', 'trojan-dropper-endpoint.info', 'malware-distribution-hub.org',
  'c2-relay-node-alpha.ru', 'c2-relay-node-beta.cn', 'exploit-kit-angler.net',
  'exploit-kit-rig.xyz', 'exploit-kit-neutrino.org', 'malvertising-redirect-01.com',
  'malvertising-redirect-02.net', 'crypto-drainer-script.cc', 'fake-wallet-login-secure.io',
  'phishing-metamask-verify.com', 'phishing-phantom-connect.net', 'dns-exfiltration-tunnel.xyz',
  'malicious-c2-gateway.net', 'stealer-log-server.xyz', 'ransomware-api-host.org',
  'phishing-verify-identity.net', 'fake-support-microsoft-alert.com', 'malware-staging-drop.cc',
  'botnet-zombie-node.ru', 'ddos-cnc-master.xyz', 'dns-covert-channel.org',
  'malicious-payload-host.ru', 'ransomware-paywall.xyz', 'stealer-exfiltration.cc',
  'phishing-banking-update.net', 'c2-command-channel.org', 'trojan-dropper-host.info',
  'exploit-payload-server.net', 'malware-command-center.ru', 'dns-tunnel-endpoint.xyz',
  'crypto-drainer-api.io', 'fake-meta-mask-auth.com', 'phishing-wallet-validator.net',
  'malicious-redirection-hub.org', 'botnet-controller-node.cc', 'apt-exfiltration-endpoint.xyz',
  'malware-drop-zone.ru', 'ransomware-payment-portal.xyz', 'c2-infrastructure.cc',
  'phishing-credential-grabber.net', 'stealer-backend.org', 'dns-tunnel-server.info',
  'c2-server-beacon.ru', 'ransomware-decryptor.xyz', 'phishing-login-portal.net',
  'malicious-payload-server.cc', 'botnet-controller.info', 'stealer-exfiltration-hub.net',
  'malware-dropzone.ru', 'ransomware-pay-api.xyz', 'phishing-auth-portal.net',
  'c2-command-node.cc', 'stealer-log-endpoint.info', 'dns-tunnel-relay.org',
  'malware-command-hub.ru', 'ransomware-key-exchange.xyz', 'phishing-secure-auth.net',
  'c2-beacon-handler.cc', 'stealer-exfil-node.info', 'dns-covert-relay.org',
  'malware-dropzone-node.ru', 'ransomware-api-gateway.xyz', 'phishing-verify-auth.net',
  'c2-infrastructure-hub.cc', 'stealer-collection-server.info', 'dns-tunnel-gateway.net',
  'malware-staging-node.ru', 'ransomware-payment-gateway.xyz', 'phishing-credential-verify.net'
]);

// Gerenciamento em memória para webhooks ativos e conexões WebSocket atreladas
const activeWebhooks = new Map();

function generateUUIDv7() {
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16).padStart(12, '0');
  
  const randBytes = new Uint8Array(10);
  crypto.getRandomValues(randBytes);
  
  randBytes[0] = (randBytes[0] & 0x0f) | 0x70; // Versão 7
  randBytes[2] = (randBytes[2] & 0x3f) | 0x80; // Variante RFC 4122
  
  const hex = Array.from(randBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8)}`;
}

function isDomainBlocked(domain) {
  if (!domain) return false;
  const lowerDomain = domain.toLowerCase();
  
  for (const suffix of BLOCKED_SUFFIXES) {
    if (lowerDomain === suffix || lowerDomain.endsWith('.' + suffix)) {
      return true;
    }
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
    // Se acessarem a raiz sem parâmetros DoH ou POST, você pode retornar a página de status ou o próprio motor DoH
    if (path === '/' || path === '') {
      // Se for um cliente DoH padrão fazendo GET ou POST na raiz, encaminha para a lógica do DoH
      if (request.method === 'POST' || url.searchParams.has('dns')) {
        // Executa a lógica de DNS que já existe no seu código
        return handleDnsQuery(request);
      }
      
      // Caso contrário, mostra uma página simples ou o status do serviço
      return new Response(JSON.stringify({ 
        service: 'NodeDoH-HyperApexShield',
        status: 'online',
        endpoints: {
          doh: '/',
          panel: '/paniel/',
          health: '/healthz'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Painel Principal de Criação de Webhooks
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
    <p>Gere endpoints dinâmicos protegidos com UUID v7 para monitoramento de requisições HTTP.</p>
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
      container.innerHTML = webhooks.map(uuid => \`
        <div class="item">
          <span>UUID: <strong>\${uuid}</strong></span>
          <div>
            <a href="/webhook/\${uuid}" target="_blank" style="margin-right: 15px;">Endpoint</a>
            <a href="/webhook/\${uuid}/paniel" target="_blank">Abrir Painel</a>
          </div>
        </div>
      \`).join('');
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

    // API para Geração Automática do UUID v7 do Webhook
    if (path === '/api/webhook/create' && request.method === 'POST') {
      const newUuid = generateUUIDv7();
      activeWebhooks.set(newUuid, { createdAt: Date.now(), sockets: [] });
      return new Response(JSON.stringify({ uuid: newUuid }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Painel Individual do Webhook (/webhook/(UUID-V7)/paniel)
    if (path.startsWith('/webhook/') && path.endsWith('/paniel')) {
      const uuid = path.split('/')[2];
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Painel Webhook - \${uuid}</title>
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
    <h1>Painel em Tempo Real: \${uuid}</h1>
    <div class="endpoint-box">URL do Endpoint: https://\${url.host}/webhook/\${uuid}</div>
    <h3>Requisições Recebidas</h3>
    <div id="logsContainer"><p style="color: #94a3b8;">Aguardando requisições em tempo real via WebSocket...</p></div>
  </div>
  <script>
    const uuid = "${uuid}";
    let db;
    
    // Configuração do IndexedDB para salvamento contínuo dos logs
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
      return \`
        <div class="log-card">
          <div class="log-header">
            <span><strong>IP:</strong> \${log.ip} | <strong>País:</strong> \${log.country}</span>
            <span>\${log.date}</span>
          </div>
          <p><strong>Headers:</strong></p>
          <pre>\${JSON.stringify(log.headers, null, 2)}</pre>
          <p style="margin-top: 10px;"><strong>Body:</strong></p>
          <pre>\${log.body}</pre>
        </div>
      \`;
    }

    // Canal WebSocket em tempo real para sincronia instantânea
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(\`\${protocol}//\${location.host}/webhook/\${uuid}/ws\`);
    
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

    // Endpoint WebSocket para Transmissão em Tempo Real
    if (path.startsWith('/webhook/') && path.endsWith('/ws')) {
      const uuid = path.split('/')[2];
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }
      
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      
      server.accept();
      
      if (!activeWebhooks.has(uuid)) {
        activeWebhooks.set(uuid, { sockets: [] });
      }
      const hookData = activeWebhooks.get(uuid);
      if (!hookData.sockets) hookData.sockets = [];
      hookData.sockets.push(server);

      server.addEventListener('close', () => {
        hookData.sockets = hookData.sockets.filter(s => s !== server);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // Receptor Principal de Requisições HTTP do Webhook
    if (path.startsWith('/webhook/')) {
      const uuid = path.split('/')[2];
      
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

      const clientIp = request.headers.get('cf-connecting-ip') || '127.0.0.1';
      const clientCountry = request.headers.get('cf-ipcountry') || 'XX';
      const currentDate = new Date().toLocaleString('pt-BR');

      const logPayload = {
        ip: clientIp,
        country: clientCountry,
        date: currentDate,
        headers: headersObj,
        body: bodyText
      };

      // Dispara o log em tempo real via WebSocket para o painel aberto
      const hookData = activeWebhooks.get(uuid);
      if (hookData && hookData.sockets) {
        const payloadString = JSON.stringify(logPayload);
        for (const sock of hookData.sockets) {
          try {
            sock.send(payloadString);
          } catch (err) {
            // Ignora conexões inativas
          }
        }
      }

      return new Response(JSON.stringify({ status: 'success', message: 'Webhook processado com sucesso' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/healthz') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        engine: 'NodeDoH-HyperApexShield-WebhookBridge',
        activeBlockRules: BLOCKED_SUFFIXES.size,
        protectionLevel: 'Hyper-Apex Carrier-Grade Deep Blocklist'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/dns-query' && request.method === 'POST') {
      try {
        const queryArrayBuffer = await request.arrayBuffer();
        const queryBuffer = Buffer.from(queryArrayBuffer);

        if (queryBuffer.length < 12) {
          return new Response('Bad Request: Payload muito curto', { status: 400 });
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
        return new Response('Bad Gateway: Falha no motor de resolução independente', { status: 502 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
