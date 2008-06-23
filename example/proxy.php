<?php
/**
 * proxy.php
 *
 * Copyright (C) 2008 Yahoo! Inc.
 *
 * A php proxy for Fire Eagle.
 *
 * See http://fireeagle.yahoo.net/developer/code/javascript
 */
header("Content-Type: text/plain; charset=utf-8");
$u = $_REQUEST['url']
if (strpos($u, "http://fireeagle.yahooapis.com/api/") != 0 &&
    strpos($u, "http://fireeagle.yahooapis.com/api/") != 0)		
  exit(1);
$d = isset($_REQUEST['data']) ? $_REQUEST['data'] : "";
$m = "";
if (isset($_REQUEST['method']))
  $m = $_REQUEST['method'];
else 
  $m = "GET";

// should also check if the url is from yahoo or not.
if ($u == null || $u == "") {
  error_log("No GET/POST var set for 'url' in " . $_SERVER['PHP_SELF']);
  exit (1);
}

$i = stripos($u, "/", 8);
$p = substr($u, $i);
$u = substr($u, 7, ($i - 7));

$d = str_replace("&amp;", "&", $d);

$r = sendToHost($u, 80, $m, $p, $d);
echo getResponse($r, false);

/* sendToHost
* ~~~~~~~~~~
* Params:
*   $host      - Just the hostname.  No http:// or 
*                /path/to/file.html portions
*   $method    - get or post, case-insensitive
*   $path      - The /path/to/file.html part
*   $data      - The query string, without initial question mark
*   $useragent - If true, 'MSIE' will be sent as 
*                the User-Agent (optional)
*
* Examples:
*   sendToHost('www.google.com','get','/search','q=php_imlib');
*   sendToHost('www.example.com','post','/some_script.cgi',
*              'param=First+Param&second=Second+param');
*/
function sendToHost($host,$port, $method,$path,$data,$useragent=0) {
  // Supply a default method of GET if the one passed was empty
  if (empty($method)) {
    $method = 'GET';
  }
  $method = strtoupper($method);
  $fp = fsockopen($host, $port);
  if ($method == 'GET') {
    $path .= '?' . $data;
  }
  fputs($fp, $method . " " . $path . " HTTP/1.0\r\n");
  fputs($fp, "Host: " . $host . "\r\n");
  fputs($fp, "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.1) Gecko/20061204 Firefox/2.0.0.1\r\n");
  fputs($fp, "Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5\r\n");
  fputs($fp, "Accept-Language: en-us,en;q=0.5\r\n");
  // fputs($fp, "Accept-Encoding: gzip,deflate\r\n");
  fputs($fp, "Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\n");
  fputs($fp, "Keep-Alive: 300\r\n");
  fputs($fp, "Referer: http://keepvid.com/\r\n");
  fputs($fp, "Content-type: application/x-www-form-urlencoded\r\n");
  fputs($fp, "Content-length: " . strlen($data) . "\r\n");
  fputs($fp, "Connection: close\r\n\r\n");
  if ($method == 'POST') {
    fputs($fp, $data);
  }

  $buf = "";
  while (!feof($fp)) {
    $buf .= fgets($fp, 128);
  }
  fclose($fp);
  return $buf;
}

function getResponse($response_data, $sendHeaders) {
  $pos = strpos($response_data, "\n\n");
  if ($pos === false) {
    $pos = strpos($response_data, "\r\n\r\n");
  }

  if ($pos === false) {
    // BAD DATA
    $return;
  }

  $headers = substr($response_data, 0, $pos);
  $data = substr($response_data, $pos + 1);
  $tok_headers = strtok($headers, "\n");
  while ($tok_headers !== false) {
    if ($sendHeaders) 
      header(trim($tok_headers));
    $tok_headers = strtok("\n");
  }
  return trim($data);
}
?>