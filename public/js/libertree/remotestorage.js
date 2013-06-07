Libertree.RemoteStorage = (function () {
    /* This is a hack.  The remote storage provider sends the
       access token in the location hash, so we cannot simply
       take it from the HTTP request.  This function forwards the
       access token as a GET request parameter. */
    $(document).ready(function () {
        var match = window.location.hash.match(/access_token=(.*)/);
        if (match) {
            window.location.replace('?access_token='+match[1]);
        }
    });
}());
