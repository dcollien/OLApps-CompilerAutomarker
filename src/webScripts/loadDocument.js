var filename;
var submissionPage, submission, i;

filename = request.data.filename;

submissionPage = OpenLearning.activity.getSubmission(request.user, [filename]);
submission = submissionPage.submission;

response.setHeader('Content-Type', 'application/json');
response.writeJSON({
	filename: filename,
	data: submission.files[0].data,
	size: submission.files[0].size
});
