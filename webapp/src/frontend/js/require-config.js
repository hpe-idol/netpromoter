require.config({
    paths: {
        'backbone':                     '../bower/backbone/backbone',
        'bootstrap':                    '../bower/bootstrap/dist/js/bootstrap',
        'datatables.net':               '../bower/datatables/media/js/jquery.dataTables',
        'datatables.bootstrap':         '../bower/datatables/media/js/dataTables.bootstrap',
        'excanvas':                     '../bower/flot/excanvas',
        'flot':                         '../bower/flot/jquery.flot',
        'flot.pie':                     '../bower/flot/jquery.flot.pie',
        'flot.resize':                  '../bower/flot/jquery.flot.resize',
        'flot.stack':                   '../bower/flot/jquery.flot.stack',
        'flot.symbol':                  '../bower/flot/jquery.flot.symbol',
        'flot.time':                    '../bower/flot/jquery.flot.time',
        'flot.tooltip':                 '../bower/flot.tooltip/js/jquery.flot.tooltip',
        'handlebars-original':          '../bower/handlebars/handlebars',
        'handlebars':                   './app/handlebars-helpers',
        'icheck':                       '../bower/icheck/icheck',
        'jquery':                       '../bower/jquery/dist/jquery',
        'jquery.ui.widget':             '../bower/jquery-file-upload/js/vendor/jquery.ui.widget',
        'jquery.iframe-transport':      '../bower/jquery-file-upload/js/jquery.iframe-transport',
        'jquery.fileupload':            '../bower/jquery-file-upload/js/jquery.fileupload',
        'socket.io':                    '../bower/socket.io-client/socket.io',
        'text':                         '../bower/requirejs-text/text',
        'underscore':                   '../bower/underscore/underscore'
    },
    shim:  {
        'bootstrap': ['jquery'],
        'flot': ['jquery'],
        'flot.pie': ['flot'],
        'flot.resize': ['flot'],
        'flot.stack': ['flot'],
        'flot.symbol': ['flot'],
        'flot.time': ['flot'],
        'flot.tooltip': ['flot'],
        'icheck': ['jquery'],
        'jquery.fileupload': ['jquery']
    }
});
