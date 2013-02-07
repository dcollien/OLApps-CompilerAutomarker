var escapeHTML, escapeObjectHTML;

escapeHTML = function(string) {
  var escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;'
    };

  return String(string).replace(/&(?!\w+;)|[<>"']/g, function (s) {
      return escapeMap[s] || s;
  });
};

escapeObjectHTML = function(obj) {
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = escapeHTML(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = escapeObjectHTML(obj[key]);
      }
    }
  }
  return obj;
};
