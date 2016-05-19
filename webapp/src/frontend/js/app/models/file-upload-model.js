define([
    'backbone'
], function(Backbone) {

    var acceptFileNames = /\.csv|xlsx|xls$/i;
    var acceptFilesTypes = /^application\/csv|text\/csv|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet$/i;

    return Backbone.Model.extend({

        defaults: {
            language: 'eng',
            socketId: null,
            data: null
        },

        validate: function(attributes) {
            if(!attributes.data) return 'error';

            var file = attributes.data.files[0];
            if (!(acceptFilesTypes.test(file.type) && acceptFileNames.test(file.name))) {
               return 'Error: file type not supported.  Please use a supported file type.';
            }
        },

        save: function() {
            this.get('data').formData = {
                socketid: this.get('socketId'),
                language: this.get('language')
            };
            this.get('data').submit();
        }
    });
});
