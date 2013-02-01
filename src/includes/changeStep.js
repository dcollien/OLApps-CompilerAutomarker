var changeStep = function(fieldName) {
	try {
		var data, stepName, action, itemIndex, pageUpdate, tmp;

		stepName = request.data.stepName;
		action = request.data.action;

		data = OpenLearning.page.getData(request.user).data;

		// ensure [fieldName] field exists
		if (!data[fieldName]) {
			data[fieldName] = [];
		}

		// find step with the same name, remove it;
		for (i = 0; i != data[fieldName].length; ++i) {
			if (data[fieldName][i].name === stepName) {
				itemIndex = i;
			}
		}

		if (action === 'delete') {
			data[fieldName].splice(itemIndex, 1);	
		} else if (action === 'up') {
			if (itemIndex > 0) {
				tmp = data[fieldName][itemIndex];
				data[fieldName][itemIndex] = data[fieldName][itemIndex-1];
				data[fieldName][itemIndex-1] = tmp;
			}
		} else if (action === 'down') {
			if (itemIndex < data[fieldName].length-1) {
				tmp = data[fieldName][itemIndex];
				data[fieldName][itemIndex] = data[fieldName][itemIndex+1];
				data[fieldName][itemIndex+1] = tmp;
			}
		}

		pageUpdate = {};
		pageUpdate[fieldName] = data[fieldName];

		// update the [fieldName] to not have the removed item
		OpenLearning.page.setData(pageUpdate, request.user);

		response.writeText('success: ' + JSON.stringify(data[fieldName]));
	} catch (err) {
		response.setStatusCode(403);
		response.writeText(err.message);
	}
};