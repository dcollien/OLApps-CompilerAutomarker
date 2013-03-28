if (data.parentScriptTarget === 'automark') {
    OpenLearning.activity.saveSubmission(
        data.parentData.user,
        {
            metadata: {
                awaitingMarking: false,
                isCompleted: false,
                submissionResults: {
                    success: false,
                    error: "Execution timed out."
                }
            } 
        }
    );
}