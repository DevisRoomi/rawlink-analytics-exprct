<?php
/**
 * RAWLINK TRACKER — Laravel Herd Gateway Proxy
 * Maps http://rawlink.test & http://rawlink-analytics-exprct.test
 * Proxies traffic to Express.js on http://127.0.0.1:5060
 */

$expressHost = 'http://127.0.0.1:5060';
$requestUri  = $_SERVER['REQUEST_URI'] ?? '/';
$method      = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Quick heartbeat probe to check if Express is active on port 5060
$ch = curl_init($expressHost . '/api/stats');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER    => true,
    CURLOPT_TIMEOUT_MS        => 600,
    CURLOPT_CONNECTTIMEOUT_MS => 400,
    CURLOPT_NOBODY            => true,
]);
$probe = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$isExpressRunning = ($httpCode > 0 && $httpCode < 500);

if ($isExpressRunning) {
    // Reverse-proxy the request to Express server
    $targetUrl = $expressHost . $requestUri;
    $headers = [];
    foreach (getallheaders() as $name => $value) {
        if (strtolower($name) !== 'host') {
            $headers[] = "$name: $value";
        }
    }
    $headers[] = 'X-Forwarded-Host: ' . ($_SERVER['HTTP_HOST'] ?? 'rawlink.test');

    $proxy = curl_init($targetUrl);
    curl_setopt($proxy, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($proxy, CURLOPT_HEADER, true);
    curl_setopt($proxy, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($proxy, CURLOPT_HTTPHEADER, $headers);

    if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
        $input = file_get_contents('php://input');
        curl_setopt($proxy, CURLOPT_POSTFIELDS, $input);
    }

    $response = curl_exec($proxy);
    $headerSize = curl_getinfo($proxy, CURLINFO_HEADER_SIZE);
    $responseCode = curl_getinfo($proxy, CURLINFO_HTTP_CODE);
    curl_close($proxy);

    $rawHeaders = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);

    http_response_code($responseCode);
    foreach (explode("\r\n", $rawHeaders) as $hdr) {
        if ($hdr && !preg_match('/^(Transfer-Encoding|Connection):/i', $hdr)) {
            header($hdr, false);
        }
    }
    echo $body;
    exit;
}

// Fallback: If Express server is idle, render wireframe standby card
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>RAWLINK TRACKER // HERD GATEWAY</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f4f4f0;
      color: #000;
      font-family: 'JetBrains Mono', monospace;
      padding: 30px 15px;
      line-height: 1.5;
    }
    .wrapper {
      max-width: 800px;
      margin: 40px auto;
      border: 2px solid #000;
      background: #fff;
      padding: 32px;
      box-shadow: 6px 6px 0px #000;
    }
    .header-bar {
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 700;
    }
    h1 {
      font-size: 28px;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      background: #000;
      color: #fff;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .cmd-box {
      background: #eee;
      border: 1px solid #000;
      padding: 16px;
      margin: 20px 0;
      font-size: 13px;
    }
    .specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 24px;
      font-size: 12px;
    }
    .spec-item {
      border: 1px solid #000;
      padding: 12px;
      background: #fafaf7;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header-bar">
      <span>[GATEWAY: LARAVEL HERD / VALET]</span>
      <span>STATUS: EXPRESS STANDBY</span>
    </div>

    <div class="badge">HERD SITE MAPPED</div>
    <h1>RAWLINK TRACKER</h1>
    <p>Pemendek URL dengan pencatatan analitik klik (User-Agent, Waktu Klik, Perangkat, OS, Browser).</p>

    <div class="cmd-box">
      $ cd C:\Users\Lenovo\Herd\rawlink-analytics-exprct<br>
      $ npm start
    </div>

    <p style="font-size: 13px;">
      Setelah Express aktif di port 5060, segarkan halaman ini untuk membuka Dashboard Wireframe, atau buka langsung di <a href="http://localhost:5060" style="color: #000; font-weight: bold;">http://localhost:5060</a>.
    </p>

    <div class="specs">
      <div class="spec-item">
        <strong>DATABASE:</strong><br>
        SQLite Native via Node stdlib (<code>node:sqlite</code>). Bebas konfigurasi tambahan.
      </div>
      <div class="spec-item">
        <strong>FRONTEND:</strong><br>
        React Dashboard bertema Archival Raw & Monospaced Wireframe.
      </div>
    </div>
  </div>
</body>
</html>
