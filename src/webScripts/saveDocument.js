var submissionFiles, submissionPage, submission, i;
var error = false;

if (request.data.isNew === true || request.data.isNew === 'true') {
    submissionPage = OpenLearning.activity.getSubmission(request.user, []);
    submissionFiles = submissionPage.submission.files;

    if (submissionFiles) {
        for (i = 0; i != submissionFiles.length; ++i) {
            if (submissionFiles[i].filename === request.data.filename) {
                response.setStatusCode(409);
                response.writeText('There is already a file of that name.');
                error = true;
                break;
            }
        }
    }
}

if (!error) {
    submissionFiles = [
        {
            filename: request.data.filename,
            data: request.data.data
        }
    ];
    OpenLearning.activity.saveSubmission(
        request.user, 
        {
            files: submissionFiles
        }, 
        'multi-file'
    );
    response.writeText('success');
}
