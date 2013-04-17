
try {
  var requestData = JSON.parse(request.data.json)

  var pageUpdate = {
    compilationFiles: requestData.compilationFiles,
    fileSystemFiles: requestData.fileSystemFiles,
    suppliedFilesSaved: true
  }

  OpenLearning.page.setData(pageUpdate, request.user);
  response.writeText('success');
} catch (err) {
  response.setStatusCode(403);
  response.writeText(err.message);
}
