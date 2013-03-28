function encodeFieldPart(boundary,name,value) {
  var return_part = "--" + boundary + "\r\n";
  return_part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
  return_part += "Content-Type: text/plain; charset=utf-8\r\n\r\n";
  return_part += value + "\r\n";
  return return_part;
}

function encodeFilePart(boundary,type,name,filename) {
  var return_part = "--" + boundary + "\r\n";
  return_part += "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n";
  return_part += "Content-Type: " + type + "\r\n\r\n";
  return return_part;
}

var CTools = {
  compileFiles: function(settings, files, flags) {
    var i, code;
    var boundary, post_data;
    var options = {
      url: settings.compileServer,
      headers: {}
    };
    var returnObj;
    
    boundary = 'FILEBOUNDARY' + (Math.floor (Math.random() * 999999999999));
    post_data = '';
    post_data += encodeFieldPart(boundary, 'privateKey', settings.privateKey);

    // add compile flags
    if (flags && flags.length != 0) {
      for (i = 0; i != flags.length; ++i) {
        if (flags[i].indexOf('-W') === 0) {
          post_data += encodeFieldPart(boundary, 'warnings', flags[i].slice('-W'.length));
        } else if (flags[i].indexOf('-std') === 0) {
          post_data += encodeFieldPart(boundary, 'std', flags[i].slice('-std'.length));
        }
      }
    }
    
    for (i = 0; i != files.length; ++i) {
      code = files[i].data;
      
      post_data += encodeFilePart(boundary, 'text/plain; charset=utf-8', files[i].filename, files[i].filename);
      post_data += code + '\r\n';
    
    }
    
    post_data += "--" + boundary + "--";
    
    options.headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
    options.headers['Content-Length'] = post_data.length;

    try {
      returnObj = {
        compiledCode: openURL( options.url, options.headers, post_data ),
        success: true
      }
      
      if (returnObj.compiledCode && returnObj.compiledCode.error) {
        returnObj.success = false;
        returnObj.error = returnObj.compiledCode.response;
      }
    } catch (err) {
      returnObj = {
        error: err,
        success: false
      }
    }

    return returnObj;
  },

  runProgram: function(compiledCode, environment) {
    eval(compiledCode);
    return Program(environment).run();
  }
};

