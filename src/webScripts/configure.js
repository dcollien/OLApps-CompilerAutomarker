include('mustache.js');
include('helpers.js');
include('escape.js');
include('settings.js');

var i, steps, renderStep, accessDenied, view, setDefault;
var settings = getSettings();

// steps which can be rendered
steps = {
  'submittedFiles': {
    template: 'submittedFiles.html',
    fields: [
      'multiFile',
      'isEmbed',
      'isUpload',
      'requiredFiles',
      'optionalFiles',
      'precludedFiles',
      'singleFileName',
      'preprocessingStepsJSON'
    ]
  },
  'suppliedFiles': {
    template: 'suppliedFiles.html'
  },
  'compilerOptions': {
    template: 'compilerOptions.html',
    fields: [
      'multiFile',
      'requiredFiles',
      'optionalFiles',
      'compilationStepsJSON'
    ]
  },
  'tests': {
    template: 'tests.html',
    fields: ['testsJSON', 'compilationSteps']
  },
  'sharing': {
    template: 'sharing.html',
    fields: [
      'tests',
      'isPublic',
      'isOutputOnlyShared',
      'isPrivate',
      'sharedFile',
      'isFileSystemExhibited'
    ]
  },
  'done': {
    template: 'done.html'
  }
};

// set up the default view
view = {
  head: '',
  csrf_token: request.csrfFormInput
};

// <head> common to all steps
view.head = '<head>\n';

view.head += '<link href="/common/bootstrap/css/bootstrap.css" rel="stylesheet">\n';
view.head += '<link href="/common/select2/select2.css" rel="stylesheet">\n';
view.head += '<link href="' + mediaURL('config.css') + '" rel="stylesheet">\n';

view.head += '<script type="text/javascript">\n';
view.head += 'alert = function(text) {\n';
view.head += '  window.app.sendMessage("notify", { "title": "Error", "text": text, "type": "error" })\n';
view.head += '};';
view.head += '</script>'
view.head += '<script type="text/javascript" src="/common/jquery.min.js"></script>\n';
view.head += request.appInitScript + '\n';
view.head += '<script type="text/javascript" src="/common/bootstrap/js/bootstrap.min.js"></script>\n';
view.head += '<script type="text/javascript" src="/common/select2/select2.min.js"></script>\n';

view.head += '</head>\n';


setDefaults = function(obj, defaultValues) {
  var key;
  for (key in defaultValues) {
    if (defaultValues.hasOwnProperty(key) && obj[key] === null || obj[key] === undefined) {
      obj[key] = defaultValues[key];
    }
  }
};

renderStep = function() {
  var step, stepData, template, page, pageData, i, field;

  step = request.args['step'];

  // default step is 'submittedFiles'
  if (step == null || steps[step] == null) {
    step = 'submittedFiles';
  }
  
  stepData = steps[step];

  // download page data
  page = OpenLearning.page.getData(request.user);
  pageData = page.data;

  // set defaults
  setDefaults(pageData, {
    multiFile: false,
    sharedFile: '',
    singleFileName: settings.defaultSingleFile,
    isEmbed: true,
    isUpload: false,
    isPublic: true,
    isOutputOnlyShared: false,
    isPrivate: false,
    requiredFiles: [],
    optionalFiles: [],
    precludedFiles: [],
    preprocessingSteps: [],
    compilationSteps: [],
    tests: [],
    isFileSystemExhibited: false
  });

  // consolidate page data booleans
  pageData.multiFile = pageData.multiFile === true || pageData.multiFile === 'true';
  pageData.isEmbed = !pageData.multiFile;
  pageData.isUpload = pageData.multiFile;
  pageData.isPublic = pageData.sharing === 'public';
  pageData.isOutputOnlyShared = pageData.sharing === 'output';
  pageData.isPrivate = pageData.sharing === 'private';
  pageData.isFileSystemExhibited = pageData.outputExhibited.indexOf('--file-system') === 0;

  // consolidate page data text
  pageData.requiredFiles = pageData.requiredFiles.join(',');
  pageData.optionalFiles = pageData.optionalFiles.join(',');
  pageData.precludedFiles = pageData.precludedFiles.join(',');

  // select any shared/exhibited outputs

  if (pageData.outputExhibited) {
    if (!pageData.isFileSystemExhibited) {
      for (i = 0; i != pageData.tests.length; ++i) {
        if (pageData.outputExhibited === pageData.tests[i].name) {
          pageData.tests[i].exhibited = true;
        }
      }
    } else {
      for (i = 0; i != pageData.tests.length; ++i) {
        if (pageData.outputExhibited === '--file-system-' + pageData.tests[i].name) {
          pageData.tests[i].fileExhibited = true;
        }
      }
    }
  }

  // consolidate page data json
  pageData.preprocessingStepsJSON = JSON.stringify(escapeObjectHTML(pageData.preprocessingSteps));
  pageData.compilationStepsJSON = JSON.stringify(escapeObjectHTML(pageData.compilationSteps));
  pageData.testsJSON = JSON.stringify(escapeObjectHTML(pageData.tests));

  // get the required template for this step
  template = include(stepData.template);

  // add the required fields from pageData to the view
  if (stepData['fields'] != null) {
    for (i = 0; i != stepData['fields'].length; ++i) {
      field = stepData['fields'][i];
      view[field] = pageData[field];
    }
  }

  view.spinner = mediaURL('loader.gif');
  view.addSourceURL = page.url + '/' + settings.codeSubPath;
  view.addFileSystemURL = page.url + '/' + settings.filesSubPath;

  render(template, view);
};


accessDenied = function() {
  var template; 
  
  template = include('accessDenied.html');
  render(template, view);
};

// check for write permission and render
checkPermission('write', renderStep, accessDenied);

