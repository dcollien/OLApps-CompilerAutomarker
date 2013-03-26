var runTests = function(compiledTests, fileSystem) {
    var decodeBase64 = function(base64_string) {
        var length;
        var lookup = {};
        var i, b=0, c, l=0, a;
        var bytes = [];
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        length = base64_string.length;


        for (i = 0; i != alphabet.length; ++i){
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
        {
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
            for (i = 0; i != argMatches.length; i++) {
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

    var runTest = function(compiledTest, fsInit) {
        var output = runProgram(compiledTest, fsInit);

        return {
            success: false,
            test: compiledTest,
            output: output,
            error: 'Not Implemented Yet'
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

