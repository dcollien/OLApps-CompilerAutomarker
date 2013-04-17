var data;

try {
  var pageUpdate = {
    isEmbedded: true,
    isAutomarked: true,
    usingEditor: request.data.usingEditor,
    multiFile: request.data.multiFile,
    requiredFiles: request.data.requiredFiles.split(','),
    optionalFiles: request.data.optionalFiles.split(','),
    precludedFiles: request.data.precludedFiles.split(','),
    singleFileName: request.data.singleFileName,
    submittedFilesSaved: true
  };
  
  if ((pageUpdate.multiFile+'') !== 'true') {
    // only a single file submitted, update preprocessing to match
    data = OpenLearning.page.getData(request.user).data;

    pageUpdate.usingEditor = true;

    // ensure preprocessingSteps field exists
    if (!data.preprocessingSteps) {
      data.preprocessingSteps = [];
    }

    // save single file name to the steps files
    for (i = 0; i != data.preprocessingSteps.length; ++i) {
      data.preprocessingSteps[i].files = pageUpdate.singleFileName;
    }

    pageUpdate.preprocessingSteps = data.preprocessingSteps;
  }
  
  OpenLearning.page.setData(pageUpdate, request.user);
  response.writeText('success');
} catch (err) {
  response.setStatusCode(403);
  response.writeText(err.message);
}
