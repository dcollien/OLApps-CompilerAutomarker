include('settings.js');

var settings = getSettings();
var filesystemPage = OpenLearning.page.readSubpage(settings.fileSubPath);
var filesystemPageFiles = filesystemPage.files;

var suppliedFileInfo = request.data.suppliedFiles;

if (!suppliedFileInfo) {
    suppliedFileInfo = [];
}

var submissionPage = OpenLearning.activity.getSubmission(request.user, null); // all file reads
var submission = submissionPage.submission;
var submissionFiles = submission.files;

var i;
var files = {};
var canOverwrite = {};
var filename;

for (i = 0; i != submissionFiles.length; ++i) {
    files[submissionFiles[i].filename] = submissionFiles[i];
}

for (i = 0; i != suppliedFileInfo.length; ++i) {
    if (suppliedFileInfo[i].overwrite) {
        canOverwrite[suppliedFileInfo[i].filename] = true;
    }
}

for (i = 0; i != filesystemPageFiles.length; ++i) {
    filename = filesystemPageFiles[i].filename;

    if (files[filename]) {
        if (canOverwrite[filename]) {
            files[filename] = filesystemPageFiles[i];
        }
    } else {
        files[filename] = filesystemPageFiles[i];
    }
}


response.setHeader('Content-Type', 'application/json');
response.writeJSON(files);
