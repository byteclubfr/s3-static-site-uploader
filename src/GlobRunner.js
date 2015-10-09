function TestHook(Glob,Q){
    Glob = Glob || require('glob').Glob;
    Q = Q || require('q');

return function GlobRunner(/*SyncedFileCollection*/ collection){
    var patterns = [];
    var globs = [];
    var globsDone = [];

    function addEachPattern(arrayLike){
        for(var i =0; i < arrayLike.length; i++){
            addPattern(arrayLike[i]);
        }
    }

    function addPattern(pattern){
        if(arguments.length > 1){
            addEachPattern(arguments);
        }
        else if(Array.isArray(pattern)){
            addEachPattern(pattern);
        }
        else if(!~patterns.indexOf(pattern)){
            patterns.push(pattern);
        }
    }

    function onMatch(filePath){
        collection.foundFile(filePath);
    }

    function createGlob(pattern){
        var glob = new Glob(pattern);
        var defer = Q.defer();

        globs.push(glob);

        glob.on('match',onMatch);

        globsDone.push(defer.promise);

        glob.on('end',defer.resolve);
        glob.on('error',defer.reject);

        return glob;
    }

    function run(){
        patterns.forEach(createGlob);
        return Q.all(globsDone).then(collection.globDone);
    }

    this.run = run;

    this.addPattern = addPattern;
    this.getPatterns = patterns.slice.bind(patterns);
};
}

var GlobRunner = TestHook();
GlobRunner.TestHook = TestHook;

module.exports = GlobRunner;
