
try {
  var pageUpdate = {
    compilationFiles: request.data.compilationFiles,
    fileSystemFiles: request.data.fileSystemFiles
  }

  OpenLearning.page.setData(pageUpdate, request.user);
  response.writeText('success');
} catch (err) {
  response.setStatusCode(403);
  response.writeText(err.message);
}
