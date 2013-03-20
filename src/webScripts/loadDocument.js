var filename, fileObj;
var submissionPage, submission, i;

filename = request.data.filename;

submissionPage = OpenLearning.activity.getSubmission(request.user, [filename]);
submission = submissionPage.submission;

fileObj = {}

for (i = 0; i != submission.files.length; ++i) {
    if (submission.files[i].filename === filename) {
        fileObj.filename = filename;
        fileObj.data = submission.files[i].data;
        fileObj.size = submission.files[i].size;
        break;
    }
}

response.setHeader('Content-Type', 'application/json');
response.writeJSON(fileObj);
