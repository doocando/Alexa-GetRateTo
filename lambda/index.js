// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const i18n = require("i18next");
const countries = require("i18n-iso-countries");

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/es.json"));


String.format = function() {
            var s = arguments[0];
            for (var i = 0; i < arguments.length - 1; i += 1) {
                var reg = new RegExp('\\{' + i + '\\}', 'gm');
                s = s.replace(reg, arguments[i + 1]);
            }
            return s;
        };

const languageStrings = {
    'en': require('./locales/en.json'),
    'en-US': require('./locales/en.json'),
    'es': require('./locales/es.json')
}
  


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput =  handlerInput.t('WELCOME_MSG'); //'Welcome, it is nice to hear you over here; how can I help you?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const ViaWelcomeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ViaWelcomeIntent';
    },
    handle(handlerInput) {
        console.log ('entre')
        const speakOutput = handlerInput.t('HELLO_MSG'); //'Hello, how can I help you?';
        console.log('speakOutput',speakOutput)
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG'); // 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput =handlerInput.t('GOODBYE_MSG'); //   'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};



// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG'); // `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = handlerInput.t('ERROR_MSG'); // `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


//******************************INTERCEPTOR **************************/

const LocalisationRequestInterceptor={
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            fallbackLng: 'en',
            resources: languageStrings
        }).then((t) => {
               handlerInput.t = (...args) => t(...args);
            });
    }
}




//******************************CUSTOM INTENTS ***********************/

function GetRateTo(sCountry, smodecurrency) {

    var rate = {
        amount: 0,
        currencyName:''
    }
    
    if (sCountry === 'COL')
        rate = {
            amount: 4001.00 ,
            currencyName : 'Colombian Pesos'
        }
    return rate

  }

const RateToIntentIntentHandler = {

   canHandle(handlerInput) {
    
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RateToIntent';
    },
    handle(handlerInput) {

        const COUNTRY_NAME = handlerInput.requestEnvelope.request.intent.slots.country.value
        const MODE_CURRENY = 'N';
        const language = "en"

        const COUNTRY_ID = countries.getAlpha3Code(COUNTRY_NAME, language);
        let rate =  GetRateTo(COUNTRY_ID, MODE_CURRENY) ;
        let speakOutput = '';
        let reprompt =   String.format( handlerInput.t('RATE_REPROMPT'),  COUNTRY_NAME);
        console.log('reprompt',reprompt );
       console.log('rate',rate );
        if (rate.amount > 0) 
            speakOutput =  String.format(handlerInput.t('RATE_MSG'),  COUNTRY_NAME ,rate.amount , rate.currencyName ); 
        else
            speakOutput =  handlerInput.t('FALLBACK_MSG'); 
        
        console.log('speakOutput',speakOutput );
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt( reprompt )
            .getResponse();
    }
};

//****************************************************************** */


// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ViaWelcomeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        RateToIntentIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
    .addRequestInterceptors(LocalisationRequestInterceptor)
    //.addRequestInterceptors(LocalizationInterceptor) 
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();