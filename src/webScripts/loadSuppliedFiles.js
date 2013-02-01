include('loadDirectoryFiles.js');

var page, pageData;

page = OpenLearning.page.getData( request.user );
pageData = loadDirectoryFiles( page.data );

pageData = loadDirectoryFiles(pageData, false);


response.writeJSON({
  compilationFiles: pageData.compilationFiles,
  fileSystemFiles: pageData.fileSystemFiles
});
