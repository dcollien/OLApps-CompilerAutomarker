
try {
  var pageUpdate = {
    sharing: request.data.sharing,
    outputExhibited: request.data.outputExhibited,
    sharedFile: request.data.sharedFile
  };

  OpenLearning.page.setData(pageUpdate, request.user);
  response.writeText('success');
} catch (err) {
  response.setStatusCode(403);
  response.writeText(err.message);
}
