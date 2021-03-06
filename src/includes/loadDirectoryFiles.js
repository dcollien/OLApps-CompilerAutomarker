var loadDirectoryFiles = function(settings, pageData, loadContents) {
  var i, j, fileSystemFilesPage, compilationFilesPage, notFound, remainingFileList, fileData, consolidateFiles;

  if (!pageData.compilationFiles) {
    pageData.compilationFiles = [];
  }

  if (!pageData.fileSystemFiles) {
    pageData.fileSystemFiles = [];
  }

  try {
    compilationFilesPage = OpenLearning.page.readSubpage(settings.codeSubPath);
  } catch (err) {
    compilationFilesPage = null;
  }

  try {
    fileSystemFilesPage = OpenLearning.page.readSubpage(settings.fileSubPath);
  } catch (err) {
    fileSystemFilesPage = null;
  }

  consolidateFiles = function(filesPage, pageField, addData) {
    // add any new files to the listing if they've been added to the directories
    if (filesPage && filesPage.files) {
      remainingFileList = [];

      for (i = 0; i != filesPage.files.length; ++i) {
        // for each file in the directory
        notFound = true;
        for (j = 0; j != pageData[pageField].length; ++j) {
          // see if it's also in the listing
          if (pageData[pageField][j].filename === filesPage.files[i].filename) {
            notFound = false;
            fileData = pageData[pageField][j];

            if (addData) {
              fileData.data = filesPage.files[i].data;
            }

            remainingFileList.push(fileData);
            break;
          }
        }

        if (notFound) {
          // new file

          fileData = {
            title: filesPage.files[i].filename,
            filename: filesPage.files[i].filename,
            size: filesPage.files[i].size,
            overwrite: true,
            readable: true,
            writable: false,
            encoding: filesPage.files[i].encoding
          };
          
          if (addData) {
            fileData.data = filesPage.files[i].data;
          }

          remainingFileList.push(fileData);
        }
      }

      pageData[pageField] = remainingFileList;
    } else {
      pageData[pageField] = [];
    }
  };
  
  consolidateFiles(fileSystemFilesPage, 'fileSystemFiles', loadContents);
  consolidateFiles(compilationFilesPage, 'compilationFiles', loadContents);

  return pageData;
};