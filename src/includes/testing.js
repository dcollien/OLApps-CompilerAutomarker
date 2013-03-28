var runTests = function(compiledTests, fileSystem) {
    var escapeHTML = function(string) {
        var escapeMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;'
        };

        return String(string).replace(/&(?!\w+;)|[<>"']/g, function (s) {
            return escapeMap[s] || s;
        });
    };

    var decodeBase64 = function(base64_string) {
        var length;
        var lookup = {};
        var i, b=0, c, l=0, a;
        var bytes = [];
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        length = base64_string.length;


        for (i = 0; i !== alphabet.length; ++i){
            lookup[alphabet.charAt(i)] = i;
        }

        for (i = 0; i < length; i++) {
            c = lookup[base64_string.charAt(i)];
            b = (b << 6) + c;
            l += 6;
            while (l >= 8) {
                ((a=(b>>>(l-=8))&0xff)||(i<(length-2))) && (bytes.push(a));
            }
        }

        return bytes;
    };

    var runCode = function(code, environment) {
        try {
            eval(code);
            return (function() {
                return Program(environment).run();
            })();
        } catch (err) {
            return err;
        }
    };

    var runProgram = function(compiledTest, fsInit) {
        var i, argInput, argMatches, args, environment, context, output;

        argInput = compiledTest.args;
        argMatches = argInput.match(/\w+|"[^"]+"/g);
        args = [];

        if (argMatches != null) {
            for (i = 0; i !== argMatches.length; i++) {
                args.push((argMatches[i].replace(/^\"|\"$/g, '')));
            }
        }

        environment = {
            args: args,
            stdin: compiledTest.stdin,
            init: fsInit
        };

        output = runCode(compiledTest.compiledCode, environment);

        console && console.log("OUT");
        console && console.log(output);

        return output;
    };

    var formatFeedback = function(feedback, programOutput, expectedOutput) {
        var i, runLength, lineStart, lineEnd;
        var feedbackParts = escapeHTML(feedback).split(/\n/);

        // indented by 4 spaces makes a pre block
        runLength = 0;
        for (i = 0; i != feedbackParts.length; ++i) {
            lineStart = '';
            lineEnd = '<br>';
            if (feedbackParts[i].indexOf('    ') === 0) {
                if (runLength === 0) {
                    lineStart = '<pre>';
                }
                lineEnd = '';

                feedbackParts[i] = feedbackParts[i].substring(4);

                runLength++;
            } else {
                if (runLength !== 0) {
                    lineStart = '</pre><br>';
                }
                runLength = 0;
            }

            feedbackParts[i] = lineStart + feedbackParts[i] + lineEnd;
        }

        feedback = feedbackParts.join('');

        var formatOutput = function(output) {
            return '<pre>' + escapeHTML(output+'') + '</pre>';
        };

        feedback = feedback.replace(/\{\{\s*stdout\s*\}\}/g, formatOutput(programOutput.stdout));
        feedback = feedback.replace(/\{\{\s*stderr\s*\}\}/g, formatOutput(programOutput.stderr));
        feedback = feedback.replace(/\{\{\s*exitCode\s*\}\}/g, formatOutput(programOutput.exitCode));
        feedback = feedback.replace(/\{\{\s*expectedStdout\s*\}\}/g, formatOutput(expectedOutput.stdout));
        feedback = feedback.replace(/\{\{\s*expectedExitCode\s*\}\}/g, formatOutput(expectedOutput.exitCode));

        return feedback;
    };

    var runTest = function(compiledTest, fsInit) {
        var i;

        var output = runProgram(compiledTest, fsInit);

        var stdout = output.stdout;
        var stderr = output.stderr;
        var exitCode = parseInt(output.exitCode, 10);

        var programOutput = {
            stdout: stdout,
            stderr: stderr,
            exitCode: exitCode
        };

        var expectedExitCode = parseInt(compiledTest.exitCode, 10);
        var expectedStdout = compiledTest.stdout;

        var expectedOutput = {
            stdout: expectedStdout,
            exitCode: expectedExitCode
        };

        var caseInsensitive = (compiledTest.caseInsensitive + '') === 'true';
        var collapseWhitespace = (compiledTest.collapseWhitespace + '') === 'true';
        var ignoreWhitespace = (compiledTest.ignoreWhitespace + '') === 'true';
        var trimWhitespace = (compiledTest.trimWhitespace + '') === 'true';

        var ignoreExitCode = (compiledTest.ignoreExitCode + '') === 'true';
        var ignoreStdout = (compiledTest.ignoreStdout + '') === 'true';
        var ignoreTrailing = (compiledTest.ignoreTrailing + '') === 'true';

        var stdoutLines, newStdoutLines;
        var expectedStdoutLines, newExpectedOutLines;
        var line;

        var success = true;
        var reason = '';

        if (caseInsensitive) {
            stdout = stdout.toLowerCase();
            expectedStdout = expectedStdout.toLowerCase();
        }

        if (trimWhitespace) {
            newStdoutLines = [];
            newExpectedOutLines = [];

            stdoutLines = stdout.split(/\r?\n/);
            expectedStdoutLines = expectedStdout.split(/\r?\n/);

            for (i = 0; i != stdoutLines.length; ++i) {
                line = stdoutLines[i].replace(/^\s+|\s+$/g, '');
                if (line !== '') {
                    newStdoutLines.push(line);
                }
            }

            for (i = 0; i != expectedStdoutLines.length; ++i) {
                line = expectedStdoutLines[i].replace(/^\s+|\s+$/g, '');
                if (line !== '') {
                    newExpectedOutLines.push(line);
                }
            }

            stdout = newStdoutLines.join('\n');
            expectedStdout = newExpectedOutLines.join('\n');
        }

        if (collapseWhitespace) {
            stdout = stdout.replace(/\s+/g,' ');
            expectedStdout = expectedStdout.replace(/\s+/g,' ');
        }

        if (ignoreWhitespace) {
            stdout = stdout.replace(/\s+/g,'');
            expectedStdout = expectedStdout.replace(/\s+/g,'');
        }

        if (!ignoreExitCode) {
            if (exitCode !== expectedExitCode) {
                success = false;

                if (compiledTest.feedbackExitCodeFail) {
                    reason += '<p>' + formatFeedback(compiledTest.feedbackExitCodeFail, programOutput, expectedOutput) + '</p>\n';
                } else {
                    reason += '<p>Program exited with code: <code>' + exitCode + '</code>,'
                    reason += ' when expecting: <code>' + expectedExitCode + '</code>.</p>\n';
                }
            }
        }

        if (!ignoreStdout) {
            if (ignoreTrailing) {
                if (stdout.indexOf(expectedStdout) !== 0) {
                    success = false;
                    if (compiledTest.feedbackStdoutFail) {
                        reason += '<p>' + formatFeedback(compiledTest.feedbackStdoutFail, programOutput, expectedOutput) + '</p>';
                    } else {
                        reason += '<p>Output did not start with: <pre>' + escapeHTML(expectedStdout) + '</pre>.</p>\n';
                    }
                }
            } else {
                if (stdout !== expectedStdout) {
                    success = false;
                    if (compiledTest.feedbackStdoutFail) {
                        reason += '<p>' + formatFeedback(compiledTest.feedbackStdoutFail, programOutput, expectedOutput) + '</p>';
                    } else {
                        reason += '<p>Output did not match: <pre>' + escapeHTML(expectedStdout) + '</pre>.</p>\n';
                    }
                }
            }
        }

        if (success) {
            reason += '<p>' + formatFeedback(compiledTest.feedbackSuccess, programOutput, expectedOutput) + '</p>';
        }

        return {
            success: success,
            test: compiledTest,
            output: output,
            feedback: reason
        }
    };

    var formatData = function(data, encoding) {
        var byteList;
        if (encoding === 'base64') {
            byteList = decodeBase64(data);
            return JSON.stringify(byteList);
        } else {
            return JSON.stringify(data);
        }
    };

    var i, file, filename;
    var result;
    var success = true;
    var allResults = [];
    var fsInit;
    var fsInitString = 'fsInit = function(fs) {\n'
    
    for (filename in fileSystem) {
        file = fileSystem[filename];
        // path, filename, data, readable, writable:
        fsInitString += "fs.createDataFile('/', '" + filename + "', " + formatData(file.data, file.encoding) + ", " + !!file.readable + ", " + !!file.writable + ");\n";
    }

    fsInitString += '\n}';
    
    eval(fsInitString);

    for (i = 0; i != compiledTests.length; ++i) {

        result = runTest(compiledTests[i], fsInit);

        allResults.push(result);
        if (!result.success) {
            success = false;
            break;
        }
    }

    return {
        success: success,
        results: allResults
    };
};

