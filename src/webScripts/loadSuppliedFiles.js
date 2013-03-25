include('loadDirectoryFiles.js');
include('settings.js');

var settings = getSettings();
var page, pageData;

page = OpenLearning.page.getData(request.user);
pageData = loadDirectoryFiles(settings, page.data, false);

response.writeJSON({
  compilationFiles: pageData.compilationFiles,
  fileSystemFiles: pageData.fileSystemFiles
});
