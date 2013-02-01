var saveStep = function(fieldName) {
	try {
		var data, step, i, saved, oldName, pageUpdate;

		// get POST data for the step
		step = request.data;

		if (step.oldName) {
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

		// ensure [fieldName] field exists
		if (!data[fieldName]) {
			data[fieldName] = [];
		}

		// find step with the same name, replace it
		for (i = 0; i != data[fieldName].length; ++i) {
			if (data[fieldName][i].name === oldName) {
				data[fieldName][i] = step;
				saved = true;
			}
		}
		
		// if not replaced, add it to the steps
		if (!saved) {
			data[fieldName].push(step);
			saved = true;
		}
		
		// update the [fieldName] field of the page data
		
		pageUpdate = {};
		pageUpdate[fieldName] = data[fieldName];

		OpenLearning.page.setData(pageUpdate, request.user);
		
		response.writeText('success: ' + JSON.stringify(data[fieldName]));
	} catch (err) {
		response.setStatusCode(403);
		response.writeText(err.message);
	}
};

