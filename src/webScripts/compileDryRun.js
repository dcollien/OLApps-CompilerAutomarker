include('submissionHelpers.js');
include('settings.js');


var page, pageData;
var submission, submissionPage;
var error, responseObject;
var filesToSubmit;
var missingFile;
var steps;
var tests, compilationSteps;
var preprocessingResult;
var files, suppliedFiles;
var compilationResponse;
var i;

var settings = getSettings();

page = OpenLearning.page.getData(request.user);
pageData = page.data;

// load submission data without loading files (null file list)
submissionPage = OpenLearning.activity.getSubmission(request.user, null);
submission = submissionPage.submission;
files = submission.files;

// filter out precluded files from the submission
filesToSubmit = filterFilesForSubmission(files, pageData);

// find any file which is required, but missing
missingFile = getMissingRequiredFile(filesToSubmit, pageData);

if (missingFile !== null) {
    // report missing file
    responseObject = {
        success: false,
        error: 'The file ' + missingFile + ' is required for the dry run'
    };
} else {
    // load the required files from the submission, including their data
    submissionPage = OpenLearning.activity.getSubmission(request.user, filesToSubmit);
    submission = submissionPage.submission;
    files = submission.files;


    // preprocess the files
    if (pageData.preprocessingSteps) {
        preprocessingResult = doPreprocessing(pageData.preprocessingSteps, files);
        files = preprocessingResult.files;
    } else {
        preprocessingResult = {
            success: true
        }
    }
    
    if (!preprocessingResult.success) {
        // there was a problem with preprocessing 
        // (e.g. required pattern not found, or forbidden pattern found)
        responseObject = preprocessingResult;
    } else {

        // get only the tests and compilation steps for the dry run
        steps = getDryRunSteps(pageData);

        // load marking code and add it to the files to compile
        files = loadFiles(settings, pageData, files)

        // go through all the compilation steps
        compilationResponse = doCompilation(settings, steps.compilationSteps, files);

        if (!compilationResponse.success) {
            // report any compilation problems
            responseObject = compilationResponse;
        } else {
            // add the compiled code to each of the dry-run tests

            tests = steps.tests;

            for (i = 0; i != tests.length; ++i) {
                tests[i].compiledCode = compilationResponse.compiledCode[tests[i].program];
            }

            // report that everything went well,
            // attach the tests with the compiled code to run
            // and the file system filenames that need to be added at run-time
            responseObject = {
                success: true,
                tests: tests,
                fileSystemFiles: page.fileSystemFiles
            }
        }        
    }
}


response.setHeader('Content-Type', 'application/json');
response.writeData(JSON.stringify(responseObject, null, 2));
