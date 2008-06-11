/**
 * OAuth Extensions
 *
 * Copyright (C) 2008 Yahoo! Inc.
 *
 * This Extension Class Added methods to the OAuth code 
 * from http://oauth.googlecode.com/svn/code/javascript/
 *
 * See http://fireeagle.yahoo.net/developer/code/javascript
 * for usage instructions.
 *
 */

/**
 * Return the proper OAuth url for any requests (auth or otherwise).
 * For GET requests, the url can be invoked directly.  For POST
 * requests, you will need to spilt the url at '?'.
 */
OAuth.getUrl = function getUrl(method, 
                               url, 
                               consumerKey,
                               consumerSecret,
                               signatureMethod,
                               token, 
                               tokenSecret, 
                               params) {
  var parameterMap = OAuth.getParams(method, 
                                     url, 
                                     consumerKey,
                                     consumerSecret,
                                     signatureMethod,
                                     token, 
                                     tokenSecret, 
                                     params);
  var keys = [];
  var paramString = "";
  for (var p in parameterMap) {
    if (typeof parameterMap[p] != 'function') {
      var value = escape(parameterMap[p]);
      value = value.replace(/\+/g, "%2B");
      value = value.replace(/\//g, "%2F");
      paramString += "&" + p + "=" + value;
    }
  }
  
  paramString = paramString.substring(1);
  var finalUrl = url + "?" + paramString;
  return finalUrl;
}

/**
 * Return the proper OAuth params as an assoc array.
 */
OAuth.getParams = function getParams(method, 
                                     url, 
                                     consumerKey,
                                     consumerSecret,
                                     signatureMethod,
                                     token, 
                                     tokenSecret, 
                                     params) {
  if (tokenSecret == null)  tokenSecret = "";

  var accessor = { consumerSecret: consumerSecret,
                   tokenSecret: tokenSecret  };
  var message = { action: url,
                  method: method,  
                  parameters: [] };
  OAuth.setParameter(message, 
                     "oauth_consumer_key", 
                     consumerKey);
  OAuth.setParameter(message, 
                     "oauth_signature_method", 
                     signatureMethod);
  OAuth.setParameter(message, 
                     "oauth_version", 
                     "1.0");
  if (token != null && token != "") {
    OAuth.setParameter(message,
                       "oauth_token",
                       token);
  }
  
  OAuth.setParameters(message, params);
  
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  
  var parameterMap = OAuth.getParameterMap(message.parameters);
  return parameterMap;
}
