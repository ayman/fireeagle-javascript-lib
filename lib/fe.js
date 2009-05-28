/**
 * FireEagle OAuth+API JavaScript Object
 *
 * Copyright (C) 2008 Yahoo! Inc.
 *
 * See http://fireeagle.yahoo.net/developer/code/javascript
 * for more info.
 *
 */

/**
 * Construct the FireEagle Object for making OAuth and API calls.
 *
 * @param consumerKey Your Application's Consumer Key.
 * @param consumerSecret Your Application's Consumer Secret.
 * @param oauthToken [OPTIONAL] Your Application's OAuth Token needed
 * for all calls except this.getRequestTokenUrl() or
 * this.getRequestTokenParams().  The token can be set later by
 * setting this.oauthToken or by using this.parseTokens().
 * @param oauthTokenSecret [OPTIONAL] Your Application's OAuth Token
 * Secret needed for all calls except this.getRequestTokenUrl() or
 * this.getRequestTokenParams().  The token can be set later by
 * setting this.oauthTokenSecret.
 */
var OAuth;
if (OAuth === undefined) {
  OAuth = {};
}

function FireEagle(consumerKey, consumerSecret, oauthToken, oauthTokenSecret) {
  this.consumerKey = consumerKey;
  this.consumerSecret = consumerSecret;
  this.signatureMethod = "HMAC-SHA1";
  this.baseUrl = "fireeagle.yahooapis.com";
  this.setSSL(true);
  if (oauthToken === undefined) {
    return;
  }
  this.oauthToken = oauthToken;
  this.oauthTokenSecret = oauthTokenSecret;
}

/**
 * An ENUM of acceptable response formats.
 */
FireEagle.RESPONSE_FORMAT = {
  xml: "xml",
  json: "json"
};

/**
 * An ENUM of the acceptable Signature Methods.
 */
FireEagle.SIGNATURE_METHOD = {
  plaintext: "PLAINTEXT",
  hmacsha1: "HMAC-SHA1"
};

/**
 * Sets SSL On or Off.
 * @param b boolean - Set to True of HTTPS is being used.
 */
FireEagle.prototype.setSSL = function setSSL(b) {
  var http = (b) ? "https://" : "http://";
  this.requestTokenURL = http + this.baseUrl + "/oauth/request_token";
  this.authorizationURL = http + "fireeagle.yahoo.net/oauth/authorize";
  this.accessTokenURL = http + this.baseUrl + "/oauth/access_token";
  this.updateURL = http + this.baseUrl + "/api/0.1/update";
  this.userURL = http + this.baseUrl + "/api/0.1/user";
  this.lookupURL = http + this.baseUrl + "/api/0.1/lookup";
  this.recentURL = http + this.baseUrl + "/api/0.1/recent";
  this.withinURL = http + this.baseUrl + "/api/0.1/within";
};

/**
 * Return if SSL is currently being used for all requests.
 * @return String True of HTTPS is being used.
 */
FireEagle.prototype.getSSL = function getSSL() {
  if (this.requestTokenURL.indexOf("https://") === 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Set the signature method for signing all requests.
 * @param s A value (hopefully) from FireEagle.SIGNATURE_METHOD.
 */
FireEagle.prototype.setSignatureMethod = function setSignatureMethod(s) {
  this.signatureMethod = s;
};

/**
 * Return the signature method.
 * @return String A value (hopefully) from FireEagle.SIGNATURE_METHOD.
 */
FireEagle.prototype.getSignatureMethod = function getSignatureMethod() {
  return this.signatureMethod;
};

/**
 * Parses a URL encoded param string and returns an assoc array.
 *
 * @param tokenString the string to parse
 * @param setValues if true, the oauth_token and oauth_token_secret in
 * the token string will be set for this object.
 */
FireEagle.prototype.parseTokens = function parseTokens(tokenString, setValues) {
  var set = true;
  if (setValues) {
    set = setValues;
  }
  var tokens = tokenString.split("&");
  var p = [];
  for (var i = 0; i < tokens.length; i++) {
    var keyValue = tokens[i].split("=");
    if (keyValue.length === 0) {
      continue;
    }
    var key = keyValue[0];
    var value = keyValue[1];
    p[key] = value;
    if ("oauth_token" === key) {
      this.oauthToken = value;
    } else if ("oauth_token_secret" === key) {
      this.oauthTokenSecret = value;
    }
  }
  return p;
};

/**
 * Return the fully constructed OAuth Request Token URL.
 *
 * @param oauth_callback [OPTIONAL] String - Callback url to bind the
 *        request token to. This will be used when the authorization
 *        step has been completed.
 * @return String The Request Token URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/usingoauth
 */
FireEagle.prototype.getRequestTokenUrl = function(oauth_callback) {
  // default oauth_callback to 'oob'
  if (oauth_callback === undefined || oauth_callback == "") {
    oauth_callback = "oob";
  }

  return OAuth.getUrl("GET",
    this.requestTokenURL,
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    undefined,
    undefined,
    { "oauth_callback": oauth_callback } );
};

/**
 * Return the params for the OAuth Request Token URL.
 *
 * @param oauth_callback [OPTIONAL] String - Callback url to bind the
 *        request token to. This will be used when the authorization
 *        step has been completed.
 * @return Object An associative object containing the params and
 * values for a Request Token URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/usingoauth
 */
FireEagle.prototype.getRequestTokenParams = function(oauth_callback) {
  // default oauth_callback to 'oob'
  if (oauth_callback === undefined || oauth_callback == "") {
    oauth_callback = "oob";
  }

  return OAuth.getParams("GET",
    this.requestTokenURL,
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    undefined,
    undefined,
    { "oauth_callback": oauth_callback } );
};

/**
 * Return an OAuth User Authorize URL.
 *
 * @return String The User Authorize URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/usingoauth
 */
FireEagle.prototype.getAuthorizeUrl = function() {
  return this.authorizationURL + "?oauth_token=" + this.oauthToken;
};

/**
 * Return the params for an OAuth User Authorize URL.
 *
 * @return Object An associative object containing the param and
 * value for an User Authorize URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/usingoauth
 */
FireEagle.prototype.getAuthorizeParams = function() {
  var o = {};
  o.oauthToken = this.oauthToken;
  return o;
};

/**
 * Return an OAuth Access Token URL.
 *
 * @param oauth_verifier String - oauth_verifier provided by Fire
 *        Eagle, either in the callback url or displayed to the user.
 * @return String The Access Token URL. Store the return values per
 * user for subsequent API calls.
 * @see http://fireeagle.yahoo.net/developer/documentation/usingoauth
 */
FireEagle.prototype.getAccessUrl = function(oauth_verifier) {
  return OAuth.getUrl("GET",
    this.accessTokenURL,
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    { "oauth_verifier": oauth_verifier } );
};

/**
 * Return the params for an OAuth Access Token URL.
 *
 * @param oauth_verifier String - oauth_verifier provided by Fire
 *        Eagle, either in the callback url or displayed to the user.
 * @return Object An associative object containing the param and
 * value for an Access Token URL.  Store the return values per user
 * for subsequent API calls.
 * @see http://fireeagle.yahoo.net/developer/documentation/usingoauth
 */
FireEagle.prototype.getAccessParams = function() {
  return OAuth.getParams("GET",
    this.accessTokenURL,
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    { "oauth_verifier": oauth_verifier } );
};

/**
 * Return the <code>/user</code> url to query for a user location.
 *
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the <code>callback</code> parameter for this
 * method.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return String The User Authorize URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/querying
 */
FireEagle.prototype.getUserUrl = function getUserUrl(format, callback) {
  var params = this.addCallback(callback);
  return OAuth.getUrl('GET',
    this.userURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/user</code> params to query for a user location.
 *
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the <code>callback</code> parameter to the
 * params object for this method.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return Object An associative object containing the param and
 * value for a User URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/querying
 */
FireEagle.prototype.getUserParams = function getUserParams(format, callback) {
  var params = this.addCallback(callback);
  return OAuth.getParams('GET',
    this.userURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/update</code> url and params to construct the
 * HTTP POST to update a user's location.
 *
 * @param params An associative object containing the params for the
 * API call. See
 * http://fireeagle.yahoo.net/developer/documentation/locdata#locparams
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return Array An array of strings [URL, POSTDATA] is returned to
 * construct XMLHTTPRequests (provided you have cross domain support
 * or a proxy.
 * @see http://fireeagle.yahoo.net/developer/documentation/updating
 */
FireEagle.prototype.getUpdateUrl = function getUpdateUrl(params, format, callback) {
  params = this.addCallback(callback, params);
  var url = OAuth.getUrl('POST',
    this.updateURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
  return url.split("?", 2);
};

/**
 * Return the <code>/update</code> params to construct the HTTP POST
 * to update a user's location.
 *
 * @param params An associative object containing the params for the
 * API call. See
 * http://fireeagle.yahoo.net/developer/documentation/locdata#locparams
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return Object An associative object containing the param and
 * value for a <code>/update</code> HTTP POST (provided you have cross
 * domain support or a proxy.
 * @see http://fireeagle.yahoo.net/developer/documentation/updating
 */
FireEagle.prototype.getUpdateParams = function getUpdateParams(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getParams('POST',
    this.updateURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/lookup</code> url to query for a user location.
 *
 * @param params An associative object containing the params for the
 * API call. See
 * http://fireeagle.yahoo.net/developer/documentation/locdata#locparams
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return String The Lookup URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/updating
 */
FireEagle.prototype.getLookupUrl = function getLookupUrl(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getUrl('GET',
    this.lookupURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/lookup</code> params to query for a location.
 *
 * @param params An associative object containing the params for the
 * API call. See
 * http://fireeagle.yahoo.net/developer/documentation/locdata#locparams
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return Object An associative object containing the param and
 * value for a <code>/user</code> URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/updating
 */
FireEagle.prototype.getLookupParams = function getLookupParams(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getParams('GET',
    this.lookupURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/recent</code> url to query for recent locations.
 *
 * @param params An associative object containing the params for the
 * API call.
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return String The <code>/recent</code>URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/querying
 */
FireEagle.prototype.getRecentUrl = function getRecentUrl(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getUrl('GET',
    this.recentURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/recent</code> params to query for recent
 * locations.
 *
 * @param params An associative object containing the params for the
 * API call.
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return Object An associative object containing the param and
 * value for a <code>/recent</code> URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/querying
 */
FireEagle.prototype.getRecentParams = function getRecentParams(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getParams('GET',
    this.recentURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/within</code> url to query for users within an
 * area.
 *
 * @param params An associative object containing the params for the
 * API call.
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return String The <code>/recent</code>URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/querying
 */
FireEagle.prototype.getWithinUrl = function getWithinUrl(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getUrl('GET',
    this.withinURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * Return the <code>/within</code> params to query for recent
 * locations.
 *
 * @param params An associative object containing the params for the
 * API call.
 * @param format [OPTIONAL] Defaults to XML. To request JSON or XML
 * set to a value in FireEagle.RESPONSE_FORMAT.  If you are requesting
 * JSON, you may also add the 'callback' parameter to the
 * <code>params</code> object for this method. If the optional
 * <code>callback</code> argument is passed it, it will take precident.
 * @param callback [OPTIONAL] String - Callback function used to wrap
 * the JSON result.  If you add this parameter to an XML request, it
 * will still be packaged and signed and ignored by FireEagle.
 * @return Object An associative object containing the param and
 * value for a <code>/recent</code> URL.
 * @see http://fireeagle.yahoo.net/developer/documentation/querying
 */
FireEagle.prototype.getWithinParams = function getWithinParams(params, format, callback) {
  params = this.addCallback(callback, params);
  return OAuth.getParams('GET',
    this.withinURL + this.getFormat(format),
    this.consumerKey,
    this.consumerSecret,
    this.signatureMethod,
    this.oauthToken,
    this.oauthTokenSecret,
    params);
};

/**
 * (Intended) Private Method to make a valid response format from a string.
 *
 * @param f [OPTIONAL]  A String format of XML or JSON.
 * @return String "." + requested format if f is not undefined.  An empty
 * string otherwise.
 */
FireEagle.prototype.getFormat = function getFormat(f) {
  if (f !== undefined && f !== "") {
    return "." + f;
  } else {
    return "";
  }
};

/**
 * (Intended) Private Method to insert the key callback with the
 * passed callback value into the specified associate array.
 *
 * @return Associated Array with the array['callback'] = callback
 * added.
 */
FireEagle.prototype.addCallback = function addCallback(callback, params) {
  if (callback === undefined || callback === '') {
    return params;
  }
  var p = params;
  if (p === undefined) {
    p = {};
    p.callback = callback;
    return p;
  }
};
