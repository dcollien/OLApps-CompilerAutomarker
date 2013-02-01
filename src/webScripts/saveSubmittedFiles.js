
try {
  var pageUpdate = {
    multiFile: request.data.multiFile,
    requiredFiles: request.data.requiredFiles,
    optionalFiles: request.data.optionalFiles,
    precludedFiles: request.data.precludedFiles
  };

  OpenLearning.page.setData(pageUpdate, request.user);
  response.writeText('success');
} catch (err) {
  response.setStatusCode(403);
  response.writeText(err.message);
}
