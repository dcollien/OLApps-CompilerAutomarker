include('mustache.js');
include('helpers.js');

var steps, renderStep, accessDenied, view, setDefault, escapeHTML, escapeObjectHTML;

// steps which can be rendered
steps = {
	'submittedFiles': {
		template: 'submittedFiles.html',
		fields: [
			'isEmbed',
			'isUpload',
			'requiredFiles',
			'optionalFiles',
			'precludedFiles',
			'singleFileName',
			'preprocessingSteps'
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
			'compilationSteps'
		]
	},
	'tests': {
		template: 'tests.html',
		fields: ['tests', 'compilationSteps']
	},
	'sharing': {
		template: 'sharing.html',
		fields: [
			'isPublic',
			'isOutputOnlyShared',
			'isPrivate',
			'sharedFile',
			'compilationSteps',
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

view.head += '<script type="text/javascript" src="/common/jquery.min.js"></script>\n';
view.head += request.appInitScript + '\n';
view.head += '<script type="text/javascript" src="/common/bootstrap/js/bootstrap.min.js"></script>\n';
view.head += '<script type="text/javascript" src="/common/select2/select2.min.js"></script>\n';

view.head += '</head>\n';

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

setDefaults = function(obj, defaultValues) {
	var key;
	for (key in defaultValues) {
		if (defaultValues.hasOwnProperty(key) && obj[key] == null) {
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
	page = OpenLearning.page.getData( request.user );
	pageData = page.data;

	// set defaults
	setDefaults(pageData, {
		multiFile: false,
		sharedFile: '',
		singleFileName: 'solution.c',
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
	pageData.isEmbed = !pageData.multiFile;
	pageData.isUpload = pageData.multiFile;
	pageData.isPublic = pageData.sharing === 'public';
	pageData.isOutputOnlyShared = pageData.sharing === 'output';
	pageData.isPrivate = pageData.sharing === 'private';

	// consolidate page data text
	pageData.requiredFiles = pageData.requiredFiles.join(',');
	pageData.optionalFiles = pageData.optionalFiles.join(',');
	pageData.precludedFiles = pageData.precludedFiles.join(',');

	// consolidate page data json
	pageData.preprocessingSteps = JSON.stringify(escapeObjectHTML(pageData.preprocessingSteps));
	pageData.compilationSteps = JSON.stringify(escapeObjectHTML(pageData.compilationSteps));
	pageData.tests = JSON.stringify(escapeObjectHTML(pageData.tests));

  // select any shared/exhibited outputs
  if (!pageData.isFileSystemExhibited) {
    if (pageData.outputExhibited) {
      for (i = 0; i != pageData.compilationSteps.length, ++i) {
        if (pageData.outputExhibited === pageData.compilationSteps[i].name) {
          pageData.compilationSteps[i].exhibited = true;
        }
      }
    }
  }

	// get the required template for this step
	template = include(stepData.template);

	// add the required fields from pageData to the view
	if (stepData['fields'] != null) {
		for (i = 0; i != stepData['fields'].length; ++i) {
			field = stepData['fields'][i];
			view[field] = pageData[field];
		}
	}

  view.addSourceURL = page.url + '/MarkingCode';
  view.addFileSystemURL = page.url + '/FileSystem';
  
	render(template, view);
};


accessDenied = function() {
	var template;	
	
	template = include('accessDenied.html');
	render(template, view);
};

// check for write permission and render
checkPermission('write', renderStep, accessDenied);

