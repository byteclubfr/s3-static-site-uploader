var mime = require('mime');

var createParams = {
    createBucket:function(bucketName){
        return {
            Bucket: bucketName
        };
    },
    /*
     *  exists and is readable - promise resolves
     *  does not exist - promise rejected with code 404 (NotFound)
     *  exists and is forbidden - 403(Forbidden)
     */
    headBucket:function(bucketName){
        return {
            Bucket:bucketName
        };
    },
    putBucketPolicy:function(bucketName,policy){
        var policyString = JSON.stringify(policy);

        return {
            Bucket:bucketName,
            Policy:policyString
        };
    },
    putObject:function(bucketName, key, body, mimeType){
        mimeType = mimeType || mime.lookup(key);

        var o = {
            Bucket:bucketName,
            Key: key,
            Body: body,
            ContentType: mimeType,
            Expires: Math.round(Date.now() / 1000 + 3600 * 24 * 365)
        };
        // must match find regex in site/package.json#gzip
        if (key.match(/\.css|\.html|\.js|\.svg$/)) {
            o.ContentEncoding = 'gzip';
        }

        return o;

    },
    putBucketWebsite:function(bucketName,index,error) {
        var params = {
            Bucket:bucketName,
            WebsiteConfiguration:{}
        };
        if(index){
            params.WebsiteConfiguration.IndexDocument = {
                Suffix:index
            };
        }
        if(error){
            params.WebsiteConfiguration.ErrorDocument = {
                Key:error
            };
        }
        return params;
    },
    listObjects:function(bucketName,prefix){
        var params = {
            Bucket:bucketName
        };
        if(prefix){
            params.Prefix = prefix;
        }
        return params;
    },
    deleteObjects:function(bucketName,keys){
        var objs = keys.map(function(key){
            return {Key:key};
        });
        return {
            Bucket:bucketName,
            Delete:{Objects:objs}
        };
    }
};

module.exports = createParams;
