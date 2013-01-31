try {
	var data, stepName, action, removeIndex;

	stepName = request.data('stepName');
	action = request.data('action');

	if (action === 'delete') {
		data = OpenLearning.page.getData(request.user).data;

		// ensure compilationSteps field exists
		if (!data.compilationSteps) {
			data.compilationSteps = [];
		}

		// find step with the same name, remove it;
		for (i = 0; i != data.compilationSteps.length; ++i) {
			if (data.compilationSteps[i].name === stepName) {
				removeIndex = i;
			}
		}

		data.compilationSteps.splice(removeIndex, 1);

		// update the compilationSteps to not have the removed item
		OpenLearning.page.setData({
			compilationSteps: data.compilationSteps;
		}, request.user);

		response.writeText('success: ' + JSON.stringify(compilationSteps));
	}
} catch (err) {
	response.setStatusCode(403);
	response.writeText(err.message);
}
