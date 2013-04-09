var loadSubmission = function() {
  var files, submissionPage, submission, i;
  var responseObject = {};

  submissionPage = OpenLearning.activity.getSubmission(request.user, []); // no file reads
  submission = submissionPage.submission;

  if (!submission || submission.pageType != 'multi-file') {
    OpenLearning.activity.saveSubmission(request.user, {}, 'multi-file');
  }
  
  if (submission) {
    files = submission.files;
  } else {
    files = [];
  }
  
  if (submissionPage) {
    responseObject.submissionURL = submissionPage.url;
  }

  responseObject.files = [];

  if (files) {
    for (i = 0; i != files.length; ++i) {
      responseObject.files.push({
        filename: files[i].filename,
        size: files[i].size
      });
    }
  }

  return responseObject;
};

response.setHeader('Content-Type', 'application/json');
response.writeJSON(loadSubmission());



