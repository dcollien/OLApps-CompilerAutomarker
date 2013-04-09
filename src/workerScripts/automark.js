include('testing.js');
include('submissionHelpers.js');
include('settings.js');


var settings = getSettings();

var page = OpenLearning.page.getData(data.user);
var pageData = page.data;

// load submission data without loading files (null file list)
var submissionPage = OpenLearning.activity.getSubmission(data.user, null);
var submission = submissionPage.submission;
var files = submission.files;


// filter out precluded files from the submission
var filesToSubmit = filterFilesForSubmission(files, pageData);

// find any file which is required, but missing
var missingFile = getMissingRequiredFile(filesToSubmit, pageData);


var compilationObject = {};
var submissionMetadata = {};

var preprocessingResult;
var compilationResponse;
var tests;
var i;

var bytesToBase64 = function(input) {
    var c1, c2, c3, i, keyString, len, out;
    keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    len = input.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = input[i++] & 0xff;
        if (i === len) {
            out += keyString.charAt(c1 >> 2);
            out += keyString.charAt((c1 & 0x3) << 4);
            out += '==';
            break;
        }
        c2 = input[i++];
        if (i === len) {
            out += keyString.charAt(c1 >> 2);
            out += keyString.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += keyString.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = input[i++];
        out += keyString.charAt(c1 >> 2);
        out += keyString.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += keyString.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += keyString.charAt(c3 & 0x3F);
    }
    return out;
};

if (missingFile !== null) {
    // report missing file
    compilationObject = {
        success: false,
        error: 'The file ' + missingFile + ' is required for submission.'
    };
} else {
    // load the required files from the submission, including their data
    submissionPage = OpenLearning.activity.getSubmission(data.user, filesToSubmit);
    submission = submissionPage.submission;
    files = submission.files;

    // preprocess the files
    if (pageData.preprocessingSteps) {
        preprocessingResult = doPreprocessing(pageData.preprocessingSteps, files);
    } else {
        preprocessingResult = {
            success: true
        }
    }

    if (!preprocessingResult.success) {
        // there was a problem with preprocessing 
        // (e.g. required pattern not found, or forbidden pattern found)
        compilationObject = preprocessingResult;
    } else {
        // load marking code and add it to the files to compile
        files = loadFiles(settings, pageData, files)

        // go through all the compilation steps
        compilationResponse = doCompilation(settings, pageData.compilationSteps, files);

        if (!compilationResponse.success) {
            // report any compilation problems
            compilationObject = compilationResponse;
        } else {
            // add the compiled code to each of the dry-run tests

            tests = pageData.tests;

            for (i = 0; i != tests.length; ++i) {
                tests[i].compiledCode = compilationResponse.compiledCode[tests[i].program];
            }

            // report that everything went well,
            // attach the tests with the compiled code to run
            // and the file system filenames that need to be added at run-time
            compilationObject = {
                success: true,
                tests: tests,
                fileSystemFiles: page.fileSystemFiles
            }
        }
    }
}

var outputFile = null;
if (compilationObject.success) {
    var testingResult = runTests(compilationObject.tests, compilationObject.fileSystemFiles);

    var results = testingResult.results;
    var conciseResults = [];

    for (i = 0; i != results.length; ++i) {
        conciseResults.push({
            success: results[i].success,
            test: {
                name: results[i].test.name
            },
            feedback: results[i].feedback
        });
    }

    submissionMetadata = {
        awaitingMarking: false,
        submissionResults: {
            results: conciseResults
        },
        isCompleted: testingResult.success
    }

    if (testingResult.success) {
        // Do exhibiting
        if (pageData.outputExhibited) {
            var fileData;
            var exhibitedData = null;

            if (pageData.outputExhibited.indexOf('--file-system') === 0) {
                for (i = 0; i != results.length; ++i) {
                    if (pageData.outputExhibited === '--file-system-' + results[i].test.name) {
                        fileData = results[i].output.files.contents[pageData.sharedFile];

                        if (fileData && fileData.contents) {
                            exhibitedData = fileData.contents;
                        }
                        break;
                    }
                }

                outputFile = {
                    filename: pageData.sharedFile,
                    data: bytesToBase64(exhibitedData),
                    encoding: 'base64'
                }
            } else {
                for (i = 0; i != results.length; ++i) {
                    if (pageData.outputExhibited === results[i].test.name) {
                        exhibitedData = results[i].output.stdout;
                        break;
                    }
                }

                outputFile = {
                    filename: 'stdout.txt',
                    data: exhibitedData
                }
            }
        }
    }
} else {
    submissionMetadata = {
        awaitingMarking: false,
        submissionResults: {
            step: compilationObject.step,
            error: compilationObject.error
        },
        isCompleted: false
    }
}

submissionMetadata.isFirstNotification = true;

var marks = {}
marks[data.user] = { completed: submissionMetadata.isCompleted };

// save marks on openlearning
OpenLearning.activity.setMarks(marks);

var submissionData = {
    metadata: submissionMetadata
};

if (outputFile) {
    if (pageData.sharing === 'outputOnly') {
        OpenLearning.activity.setSubmissionExhibit(
            data.user, 'file', outputFile.filename, {
                file: outputFile
            }
        );
    } else if (pageData.sharing === 'public') {
        submissionData.files = [outputFile];   
    }
}

OpenLearning.activity.saveSubmission(
    data.user,
    submissionData,
    'multi-file'
);

