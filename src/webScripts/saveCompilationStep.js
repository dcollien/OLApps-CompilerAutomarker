try {
	var data, step, i, saved, oldName;

	// get POST data for the step
	step = request.data;

	if (step.oldName != null) {
		oldName = step.oldName;
	} else {
		oldName = step.name;
	}
	
	if (!step.name) {
		throw {
			name: 'Invalid POST data',
			message: 'Step must have name'
		}
	}

	saved = false;

	// retrieve page data
	data = OpenLearning.page.getData(request.user).data;

	// ensure compilationSteps field exists
	if (!data.compilationSteps) {
		data.compilationSteps = [];
	}

	// find step with the same name, replace it
	for (i = 0; i != data.compilationSteps.length; ++i) {
		if (data.compilationSteps[i].name === oldName) {
			data.compilationSteps[i] = step;
			saved = true;
		}
	}

	// if not replaced, add it to the steps
	if (!saved) {
		data.compilationSteps.push(step);
		saved = true;
	}

	// update the compilationSteps field of the page data
	OpenLearning.page.setData({
		compilationSteps: data.compilationSteps
	}, request.user);
	
	response.writeText('success: ' + JSON.stringify(data.compilationSteps));
} catch (err) {
	response.setStatusCode(403);
	response.writeText(err.message);
}

