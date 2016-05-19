module.exports = {

    websocketEvents: {
        analysis: {
            complete: 'analysis:complete',
            error: 'analysis:error',
            progress: 'analysis:progress'
        },
        parsing: {
            started: 'parsing:started'
        },
        sentimentAnalysis: {
            started: 'sentiment:started'
        }
    },

    npsTypes: {
        promoter: "promoter",
        passive: "passive",
        detractor: "detractor"
    },
    questions: {
        question2: "QUESTION2",
        question3: "QUESTION3"
    },
    sentiments: {
        positive: "positive",
        negative: "negative",
        either: "positive,negative",
        none: "none"
    },
    analysisQuestions: {
        recommend: "RECOMMEND",
        improve: "IMPROVE"
    },

    http: {
        verbs: {
            post: 'POST',
            get: 'GET',
            delete: 'DELETE'
        }
    }
};
