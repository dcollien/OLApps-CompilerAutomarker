if (request.data.action === "submit") {
    OpenLearning.activity.saveSubmission(
        request.user,
        {
            metadata: {
                awaitingMarking: true
            }
        }
    );
    
    OpenLearning.activity.submit(request.user);
}


response.setHeader('Content-Type', 'application/json');
response.writeJSON({
    success: true
});
