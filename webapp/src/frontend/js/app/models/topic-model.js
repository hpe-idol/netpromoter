define([
    'backbone'
], function(Backbone) {
    return Backbone.Model.extend({

        parse: function(response){
            var isTopic = response.sentiment[0] !== 'none';
            return {
                sentimentText: response.sentimenttext ? response.sentimenttext[0] : 'N/A',
                content: response.content,
                score: response.score[0],
                npsType: response.nps_type ? response.nps_type[0] : 'N/A',
                answer: isTopic ? response.answer[0]: response.content,
                isTopic: isTopic
            };
        }
    });
});