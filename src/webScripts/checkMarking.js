var submissionPage = OpenLearning.activity.getSubmission(request.user);
var submission = submissionPage.submission;
var isReady = true;
var isCompleted = false;
var submissionResults = '';

if (submission.metadata) {
    if (submission.metadata.awaitingMarking) {
        isReady = false;
    }

    isCompleted = submission.metadata.isCompleted;
    submissionResults = submission.metadata.submissionResults;
}

response.setHeader('Content-Type', 'application/json');
response.writeJSON({
    isReady: isReady,
    isCompleted: isCompleted,
    submissionResults: submissionResults
});
