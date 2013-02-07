include('mustache.js');
include('helpers.js');
include('escape.js');

var view;
var accessDenied, renderEditor;


// set up the default view
view = {
  head: '',
  csrf_token: request.csrfFormInput,

  compiling_spinner: mediaURL('compiling.gif'),
  running_spinner: mediaURL('running.gif'),
  submitting_spinner: mediaURL('submitting.gif'),
  waiting_spinner: mediaURL('waiting.gif'),

  compile_icon: mediaURL('compile.png'),
  compiled_icon: mediaURL('compiled.png'),
  cross_icon: mediaURL('cross.png'),
  tick_icon: mediaURL('tick.png'),
  undo_icon: mediaURL('undo.png'),
  redo_icon: mediaURL('redo.png')
};

// <head> tag contents

view.head += '<title>Editor</title>\n';

view.head += '<link href="/common/bootstrap/css/bootstrap.css" rel="stylesheet">\n';
view.head += '<link href="/common/select2/select2.css" rel="stylesheet">\n';
view.head += '<link href="' + mediaURL('codemirror.css') + '" rel="stylesheet">\n';

view.head += '<script type="text/javascript">\n';
view.head += 'alert = function(text) {\n';
view.head += '  window.app.sendMessage("notify", { "title": "Error", "text": text, "type": "error" })\n';
view.head += '};';
view.head += '</script>'

view.head += '<script type="text/javascript" src="/common/jquery.min.js"></script>\n';
view.head += '<script type="text/javascript" src="/common/bootstrap/js/bootstrap.min.js"></script>\n';
view.head += '<script type="text/javascript" src="' + mediaURL('codemirror.js') + '"></script>\n';
view.head += '<script type="text/javascript" src="' + mediaURL('clike.js') + '"></script>\n';
view.head += '<script type="text/javascript" src="' + mediaURL('bootbox.min.js') + '"></script>\n';
view.head += request.appInitScript + '\n';
view.head += '<script type="text/javascript" src="/common/select2/select2.min.js"></script>\n';



renderEditor = function() {
  var template = include('editor.html');
  render(template, view);
};

accessDenied = function() {
  var template;
  
  template = include('accessDenied.html');
  render(template, view);
};

// check for write permission and render
checkPermission('write', renderEditor, accessDenied);