var submissionPage = OpenLearning.activity.getSubmission(request.user);
var submission = submissionPage.submission;
var isReady = true;
var isCompleted = false;
var submissionResults = '';
var isFirstNotification = false;

if (submission.metadata) {
    if (submission.metadata.awaitingMarking) {
        isReady = false;
    }

    isCompleted = submission.metadata.isCompleted;
    submissionResults = submission.metadata.submissionResults;
}

if (submission.metadata.isFirstNotification) {
    isFirstNotification = true;
    
    submission.metadata.isFirstNotification = false;
    OpenLearning.activity.saveSubmission(request.user,
        {
            metadata: submission.metadata
        });
    
}

response.setHeader('Content-Type', 'application/json');
response.writeJSON({
    isReady: isReady,
    isCompleted: isCompleted,
    submissionResults: submissionResults,
    isFirstNotification: isFirstNotification
});
