var filenameMatch, checkSubmission, getDryRunTests, getMissingRequiredFile;
var doPreprocessing, doCompilation, processFiles;
var requireAllFiles, forbidAllFiles, replaceAllFiles;
var loadAutomarkingFiles, loadFiles;

include('cTools.js');

filenameMatch = function (filename, matchString) {
    if (matchString.match(/\*/) || matchString.match(/\?/)) {
        matchString = '^' + matchString.replace(/\./, '\\.').replace(/\*/, '.*').replace(/\?/, '.') + '$';
        return filename.match(matchString) !== null;
    } else {
        return filename === matchString;
    }
};

// filters out all precluded files from the submission
filterFilesForSubmission = function(submittingFiles, pageData) {
    var requiredFiles = pageData.requiredFiles;
    var optionalFiles = pageData.optionalFiles;
    var precludedFiles = pageData.precludedFiles;

    var i, fileIndex, filename;
    var isRequired, isOptional, isPrecluded;

    var filesToSubmit = [];

    for (i = 0; i != submittingFiles.length; ++i) {
        filename = submittingFiles[i].filename;
        isRequired = false;
        isOptional = false;
        isPrecluded = false;
        if (requiredFiles.indexOf(filename) >= 0) {
            isRequired = true;
        } else {
            for (fileIndex = 0; fileIndex != optionalFiles.length; ++fileIndex) {
                if (filenameMatch(filename, optionalFiles[fileIndex])) {
                    isOptional = true;
                    break;
                }
            }
        }

        if (!isRequired && !isOptional) {
            for (fileIndex = 0; fileIndex != precludedFiles.length; ++fileIndex) {
                if (filenameMatch(filename, precludedFiles[fileIndex])) {
                    isPrecluded = true;
                    break;
                }
            }
        }

        if (!isPrecluded) {
            filesToSubmit.push(filename);
        }
    }

    return filesToSubmit;
};

// returns the first required filename found which has not been submitted
// returns null if none were found
getMissingRequiredFile = function(filenames, pageData) {
    var requiredFiles = pageData.requiredFiles;
    var i, requiredFile;

    for (i = 0; i != requiredFiles.length; ++i) {
        requiredFile = requiredFiles[i];

        if (filenames.indexOf(requiredFile) < 0) {
            return requiredFile;
        }
    }

    return null;
};

// get the compilation and testing steps required for a dry run
getDryRunSteps = function(pageData) {
    var i;
    
    var tests = [];
    var compilationSteps = [];

    var programs = {};

    // Load tests where dryRun == true, extract "program"
    for (i = 0; i != pageData.tests.length; ++i) {
        if ((pageData.tests[i].dryRun + '') === 'true') {
            // add this to our tests to run in the dryrun
            tests.push(pageData.tests[i]);

            // add this program to the set of programs to compile for the dryrun
            programs[pageData.tests[i].program] = 'dryRun';
        }
    }

    // Load compilationSteps where name == program
    for (i = 0; i != pageData.compilationSteps.length; ++i) {
        // see if this compilation step makes a program we need to run
        if (programs[pageData.compilationSteps[i].name] === 'dryRun') {
            // add this compilation step to the dry run
            compilationSteps.push(pageData.compilationSteps[i]);
        }
    }

    return {
        tests: tests,
        compilationSteps: compilationSteps
    }
};


requireAllFiles = function(match, files, nameMatch) {
    var i;

    for (i = 0; i != files.length; ++i) {
        if (filenameMatch(files[i].filename, nameMatch)) {
            if (match.match(files[i].data) === null) {
                return false;
            }
        }
    }

    return true;
};

forbidAllFiles = function(match, files, nameMatch) {
    var i;

    for (i = 0; i != files.length; ++i) {
        if (filenameMatch(files[i].filename, nameMatch)) {
            if (match.match(files[i].data) !== null) {
                return false;
            }
        }
    }

    return true;   
};

replaceAllFiles = function(search, replace, files, nameMatch) {
    var i;

    for (i = 0; i != files.length; ++i) {
        if (filenameMatch(files[i].filename, nameMatch)) {
            files[i].data = files[i].data.replace(search, replace);
        }
    }

    return files;   
};

processFiles = function(filesWithData, preprocessingStep, matchString) {
    var re;
    var result = {
        action: preprocessingStep.action,
        success: false
    };

    if (matchString == null) {
        result.message = 'Match String Undefined';
        return result;
    }

    re = new RegExp(preprocessingStep.search);
    if (preprocessingStep.action === "replace") {
        result.success = true;
        replaceAllFiles(re, preprocessingStep.replace, filesWithData, matchString);
    } else if (preprocessingStep.action === "require") {
        result.success = requireAllFiles(re, filesWithData, matchString);
        result.message = 'A requirement was not met';
    } else if (preprocessingStep.action === "forbid") {
        result.success = forbidAllFiles(re, filesWithData, matchString);
        result.message = 'A file contains forbidden data';
    }

    return result;
};

// perform preprocessing steps on the files
doPreprocessing = function(preprocessingSteps, filesWithData) {
    var i, fileIndex;
    var fileMatches, matchString;
    var result;

    for (i = 0; i != preprocessingSteps.length; ++i) {
        fileMatches = preprocessingSteps[i].files.split(',');
        for (fileIndex = 0; fileIndex != fileMatches.length; ++fileIndex) {
            matchString = fileMatches[fileIndex];
            result = processFiles(filesWithData, preprocessingSteps[i], matchString);

            if (!result.success) {
                return {
                    success: false,
                    error: result.message
                }
            }
        }
    }

    return {
        success: true
    };
};

// download files on the automarking code subpage
loadAutomarkingFiles = function(settings) {
    var markingCodePage = OpenLearning.page.readSubpage(settings.codeSubPath);
    return markingCodePage.files;
};

// load automarking files and combine them with the submitted files
loadFiles = function(settings, pageData, files) {
    var i, file;
    var suppliedFiles = loadAutomarkingFiles(settings);

    var filenames = {};
    var suppliedFileLookup = {};

    for (i = 0; i != files.length; ++i) {
        filenames[files[i].filename] = files[i].filename;
    }

    for (i = 0; i != suppliedFiles.length; ++i) {
        file = suppliedFiles[i];
        suppliedFileLookup[file.filename] = file;
    }

    // go through automarking supplied files
    for (i = 0; i != pageData.compilationFiles.length; ++i) {
        if (filenames[file.filename] === file.filename) {
            // a file has already been submitted with this name
            if (file.overwrite && (file.overwrite+'') === 'true') {
                // overwrite with the supplied file
                pageData.compilationFiles[i] = suppliedFileLookup[file.filename];
            }
            // otherwise skip the supplied file
        } else {
            // no submitted file with the supplied file's name, add it to the files to compile
            files.push(suppliedFileLookup[file.filename]);
        }
    }

    return files;
};


doCompilation = function(settings, compilationSteps, filesWithData) {
    var i, fileIndex, step;
    var files, file, flags;
    var filesToSend;
    var fileLookup = {};
    var compiledCode = {};
    var compileOutput;

    for (i = 0; i != filesWithData.length; ++i) {
        file = filesWithData[i];
        fileLookup[file.filename] = file;
    }

    for (i = 0; i != compilationSteps.length; ++i) {
        step = compilationSteps[i];
        files = step.files.split(',');
        flags = step.flags.split(',');

        filesToSend = [];
        for (fileIndex = 0; fileIndex != files.length; ++fileIndex) {
            if (!fileLookup[files[fileIndex]]) {
                return {
                    success: false,
                    step: step,
                    error: JSON.stringify(filesWithData) + '\n' + JSON.stringify(files) + '\n' + files[fileIndex]
                };
            }
            filesToSend.push(fileLookup[files[fileIndex]]);
        }

        compileOutput = CTools.compileFiles(settings, filesToSend, flags);
        if (compileOutput.success) {
            compiledCode[step.name] = compileOutput.compiledCode;
        } else {
            return {
                success: false,
                step: step,
                error: compileOutput.error
            };
        }
    }

    return {
        success: true,
        compiledCode: compiledCode
    }
};


