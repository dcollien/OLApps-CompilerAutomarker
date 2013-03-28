
try {
  var pageUpdate = {
    isEmbedded: true,
    multiFile: request.data.multiFile,
    requiredFiles: request.data.requiredFiles.split(','),
    optionalFiles: request.data.optionalFiles.split(','),
    precludedFiles: request.data.precludedFiles.split(','),
    singleFileName: request.data.singleFileName
  };
  
  OpenLearning.page.setData(pageUpdate, request.user);
  response.writeText('success');
} catch (err) {
  response.setStatusCode(403);
  response.writeText(err.message);
}
