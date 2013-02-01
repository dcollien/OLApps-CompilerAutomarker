include('loadDirectoryFiles.js');

var page, pageData;

page = OpenLearning.page.getData( request.user );
pageData = loadDirectoryFiles( page.data, false );

response.writeJSON({
  compilationFiles: pageData.compilationFiles,
  fileSystemFiles: pageData.fileSystemFiles
});
