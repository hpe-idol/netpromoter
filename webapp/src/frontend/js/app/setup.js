define([
    'jquery'
], function($) {
    return function() {
        $.ajaxSetup({
            statusCode: {
                401: function () {
                    window.location.pathname = '/sso';
                }
            }
        });
    }
});