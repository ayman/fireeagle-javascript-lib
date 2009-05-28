/**
* init.js
*
* Copyright (C) 2008 Yahoo! Inc.
*
* Sample JavaScript to make FireEagle OAuth requests.
*
* See http://fireeagle.yahoo.net/developer/code/javascript
*/

var fe;

function init() {
  var t  = document.getElementById('reqtoken').value;
  var s = document.getElementById('reqstoken').value;
  var c = document.getElementById('usessl').checked;
  fe = new FireEagle(t, s);
  fe.setSSL(c);
  document.getElementById('updates').style.display = "none";
}

function fillBlanks(div, url) {
  var text = "";
  text = "<a href='";
  text += url;
  text += "' target='_blank'>";
  text += url;
  text += "</a>";
  document.getElementById(div).innerHTML = text;
}

function getRequestTok() {
  init();
  var url = fe.getRequestTokenUrl(document.getElementById('oauth_callback').value);
  fillBlanks('texty', url);
  return url;
}

function userAuth() {
  init();
  fe.oauthToken = document.getElementById('token').value;
  var url = fe.getAuthorizeUrl();
  fillBlanks('authurl', url);
  return url;
}

function getAccess() {
  init();
  fe.oauthToken = document.getElementById('atoken').value;
  fe.oauthTokenSecret = document.getElementById('astoken').value;
  var url = fe.getAccessUrl(document.getElementById('oauth_verifier').value);
  fillBlanks('accessurl', url);
  return url;
}

function getRequest(format) {  
  init();
  fe.oauthToken = document.getElementById('qtoken').value;
  fe.oauthTokenSecret = document.getElementById('qstoken').value;
  var url;
  if (format)
  url = fe.getUserUrl(format);
  else
  url = fe.getUserUrl();
  fillBlanks('requests', url);
  return url;
}

function getLookup(format, general) {  
  init();
  var gt = null;
  var gts = null;
  if (general) {
    fe.oauthToken = document.getElementById('gt').value;
    fe.oauthTokenSecret = document.getElementById('gts').value;
  } else {
    fe.oauthToken = document.getElementById('qtoken').value;
    fe.oauthTokenSecret = document.getElementById('qstoken').value;
  }
  var q;
  if (format) 
  q = document.getElementById('lqg').value;
  else
  q = document.getElementById('lq').value;
  var o = new Object(); 
  o.address = q;
  var url;
  if (format)
  url = fe.getLookupUrl(o, format);
  else
  url = fe.getLookupUrl(o);
  if (general)
  fillBlanks('lookupspang', url);
  else 
  fillBlanks('lookupspan', url);
  return url;
}

function getRecent(format) {  
  init();
  var gt = null;
  var gts = null;
  fe.oauthToken = document.getElementById('gt').value;
  fe.oauthTokenSecret = document.getElementById('gts').value;
  var t = document.getElementById('rTime').value;
  var c = document.getElementById('rCount').value;
  var o = new Object(); 
  o.per_page = c;
  o.time = t;
  var url;
  if (format)
  url = fe.getRecentUrl(o, format);
  else
  url = fe.getRecentUrl(o);
  fillBlanks('recentspan', url);
  return url;
}

function getWithin(format) {  
  init();
  var gt = null;
  var gts = null;
  fe.oauthToken = document.getElementById('gt').value;
  fe.oauthTokenSecret = document.getElementById('gts').value;
  var place = document.getElementById('placeid').value;
  var woe = document.getElementById('woeid').value;
  var o = new Object(); 
  o.place_id = place;
  o.woeid = woe;
  var url;
  if (format)
  url = fe.getWithinUrl(o, format);
  else
  url = fe.getWithinUrl(o);
  fillBlanks('withinspan', url);
  return url;
}


function getUpdate(post, format) {
  init();
  fe.oauthToken = document.getElementById('qtoken').value;
  fe.oauthTokenSecret = document.getElementById('qstoken').value;
  var q = document.getElementById('loc').value;
  var o = new Object(); 
  o.postal = q;
  var l;
  if (format)
  l = fe.getUpdateUrl(o, format);
  else 
  l = fe.getUpdateUrl(o);
  var url = l[0];
  var postData = l[1];
  var udiv = document.getElementById('updates');
  udiv.innerHTML = '<code>curl -d "' + postData + '" ' + url + "</code>";
  var proxy = "proxy.php";
  var method = "POST";
  var proxyUrl = proxy + 
  "?method=" + Url.encode(method) +
  "&url=" + Url.encode(url) +
  "&data="+ Url.encode(postData);
  udiv.innerHTML += "<p>PROXY: " + proxyUrl + "</p><p>";
  document.getElementById('updates').style.display = "block";

  if (!post) return;

  var handleSuccess = function(o){    
    // console.log("The success handler was called.  tId: " + o.tId + ".", "info", "example");
    var div = document.getElementById('updates');
    if(o.responseText !== undefined) {
      div.innerHTML += "<br/> Transaction id: " + o.tId;
      div.innerHTML += "<br />HTTP status: " + o.status;
      div.innerHTML += "<br />Status code message: " + o.statusText;
      var r = o.responseText;
      r = r.replace(/</g, "&lt;");
      r = r.replace(/>/g, "&gt;");
      r = "<pre>" + r + "</pre>";
      div.innerHTML += r;
    }
  };
  
  var handleFailure = function(o){
    var div = document.getElementById('updates');    
    if(o.responseText !== undefined){
      div.innerHTML += "<br /> <li>Transaction id: " + o.tId + "</li>";
      div.innerHTML += "<br /><li>HTTP status: " + o.status + "</li>";
      div.innerHTML += "<br /><li>Status code message: " + o.statusText + "</li>";
      var r = o.responseText;
      r = r.replace(/</g, "&lt;");
      r = r.replace(/>/g, "&gt;");
      r = "<pre>" + r + "</pre>";
      div.innerHTML += r;
    }
  };
  
  var callback = {
    success:handleSuccess,
    failure: handleFailure
  };

  var request = YAHOO.util.Connect.asyncRequest(method, 
                                                proxyUrl,
                                                callback); 
  }

  function getHTTPGetRequest(url, message) {
    var udiv = document.getElementById('updates');
    udiv.innerHTML = "<b>" + message + "</b><br/>";
    init();
    fe.oauthToken = document.getElementById('qtoken').value;
    fe.oauthTokenSecret = document.getElementById('qstoken').value;

    var proxy = "http://timetags.research.yahoo.com/js-oauth/FireEagle/proxy.php";
    var method = "GET";
    var proxyUrl = proxy +  "?method=" + Url.encode(method) +
    "&url=" + Url.encode(url);

    var handleSuccess = function(o){    
      var div = document.getElementById('updates');
      if(o.responseText !== undefined) {
        div.innerHTML += "<br/> Transaction id: " + o.tId;
        div.innerHTML += "<br/>HTTP status: " + o.status;
        div.innerHTML += "<br/>Status code message: " + o.statusText;
        var r = o.responseText;
        r = r.replace(/</g, "&lt;");
        r = r.replace(/>/g, "&gt;");
        r = "<pre>" + r + "</pre>";
        div.innerHTML += r;
      }
    };

    var handleFailure = function(o){
      var div = document.getElementById('updates');    
      if(o.responseText !== undefined){
        div.innerHTML += "<br /> <li>Transaction id: " + o.tId + "</li>";
        div.innerHTML += "<li>HTTP status: " + o.status + "</li>";
        div.innerHTML += "<li>Status code message: " + o.statusText + "</li>";
        var r = o.responseText;
        r = r.replace(/</g, "&lt;");
        r = r.replace(/>/g, "&gt;");
        r = "<pre>" + r + "</pre>";
        div.innerHTML += r;
      }
    };
    
    var callback = {
      success:handleSuccess,
      failure: handleFailure
    };

    var request = YAHOO.util.Connect.asyncRequest(method, 
                                                  proxyUrl,
                                                  callback); 
  }

  var Url = {
    // public method for url encoding
    encode : function (string) {
      var s = escape(string);
      s = s.replace(/\+/g, "%2B");
      s = s.replace(/\//g, "%2F");
      return s;
  }
}
