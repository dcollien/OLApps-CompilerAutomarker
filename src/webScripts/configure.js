include('mustache.js');
include('helpers.js');

var steps, renderStep, accessDenied, view;

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
		fields: ['tests']
	},
	'sharing': {
		template: 'sharing.html',
		fields: [
			'isPublic',
			'isOutputOnlyShared',
			'isPrivate',
			'sharedFile',
			'compilationSteps'
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

	if (pageData.configured) {
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
		pageData.preprocessingSteps = JSON.stringify(pageData.preprocessingSteps);
		pageData.compilationSteps = JSON.stringify(pageData.compilationSteps);
		pageData.tests = JSON.stringify(pageData.tests);
	} else {
		// set defaults
		pageData.multiFile = false;
		pageData.sharedFile = '';
		pageData.singleFileName = 'solution.c';

		pageData.isEmbed = true;
		pageData.isUpload = false;
		pageData.isPublic = true;
		pageData.isOutputOnlyShared = false;
		pageData.isPrivate = false;
		pageData.requiredFiles = '';
		pageData.optionalFiles = '';
		pageData.precludedFiles = '';
		pageData.preprocessingSteps = '[]';
		pageData.compilationSteps = '[]';
		pageData.tests = '[]';
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

	render(template, view);
};


accessDenied = function() {
	var template;	
	
	template = include('accessDenied.html');
	render(template, view);
};

// check for write permission and render
checkPermission('write', renderStep, accessDenied);

