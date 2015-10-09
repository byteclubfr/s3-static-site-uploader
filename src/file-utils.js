var fs = require('fs');
var crypto = require('crypto');
var Q = require('q');
var _ = require('lodash');

var MAX_OPEN = 200;
var openCount = 0;
var cache = [];

function _readNextFile(){
    if(openCount < MAX_OPEN && cache.length > 0){
        openCount++;
        var nextCall = cache[0];
        cache = cache.slice(1);

        fs.readFile(nextCall.fileName,nextCall.options,function(err,result){
            try {
                if(err){
                    nextCall.deferred.reject(err);
                }
                else {
                    nextCall.deferred.resolve(result);
                }
            }
            finally {
                openCount--;
                _readNextFile();
            }
        });
    }
}

function readFile(fileName,opts){
    var deferred = Q.defer();
    cache.push({fileName:fileName, options:opts,deferred:deferred});
    _readNextFile();
    return deferred.promise;
}

function promise_translate(input,fn){
    return input.map(function(val){return val.then(fn);})
}

function getFileContents(path,encoding){
    if(Array.isArray(path)){
        var _readFile = _.partial(readFile,_,encoding);
        return Q.all(path.map(_readFile));
    }
    return readFile(path,encoding);
}

function md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}

function getContentHashPromises(paths){
    return promise_translate(paths.map(_.ary(readFile, 1)),md5);
}

function getContentHash(path){
    if(Array.isArray(path)){
        return Q.all(getContentHashPromises(path));
    }
    return readFile(path).then(md5);
}

function exists(path){
    var deferred = Q.defer();
    fs.exists(path,deferred.resolve);
    return deferred.promise;
}


module.exports = {
    _fs:fs,
    md5:md5,
    getContents: getFileContents,
    getContentHash: getContentHash,
    exists:exists,
    get MAX_OPEN(){return MAX_OPEN;},
    set MAX_OPEN(mo){MAX_OPEN = mo; _readNextFile();}
};
