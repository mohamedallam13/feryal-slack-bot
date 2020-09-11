;(function(root,factory){
  root.ferSlackBot = factory()
})(this,function(){
  
  var ferSlackBot = {};
  
  const REPLIES_FILE_ID = '1R-Pl9LRj1-Pd7OV15befXV9UzyxHAyfz';
  const COMMANDS_FILE_ID = '1PgdZWT7cLW5yN5JtdSZhQfw-cp7w2Vld';
  const EVENTS_LOGS_FILE_ID = '1w-YR6LnQgQbMY6MqIYKGKNoxvJ3ZijQj';
  const ACCESS_TOKEN_FILE = '1ljQBQ2OA8pMCPMtcZiYz5OFrYYLGXXlD';

  var POST_MESSAGE_ENDPOINT = 'https://slack.com/api/chat.postMessage';
  
  const SLACK_ACCESS_TOKEN = Toolkit.readFromJSON(ACCESS_TOKEN_FILE);
  var replies = Toolkit.readFromJSON(REPLIES_FILE_ID);
  var allKeywords = Toolkit.readFromJSON(COMMANDS_FILE_ID);
  var commandChart = convertToCommands(allKeywords);
  
  var channels = {
    mod: {name: 'moderationchannel', id: ''},
    posting: {name: 'postingchannel', id: ''},
    ground: {name: 'groundteam', id: ''},
    comm: {name: 'communitygroup', id: 'CTVJWH7D4'}
  }
  
  var paths = {
    autoMod: moderationLibrary.criticalPostAlert,
    formUpdate: groundteamLibrary.alertCurrentDocCount,
    checkPostedToday: postingLibrary.alertDelayPosting
  }
  
  var logFileObj = Toolkit.readFromJSON(EVENTS_LOGS_FILE_ID);
  var event_id
  
  function convertToCommands(allKeywords){
    var obj = {};
    var keys = Object.keys(allKeywords);
    var lastKeys
    keys.forEach(function(key){
      if(Array.isArray(allKeywords[key])){
        lastKeys = allKeywords[key];
      }else{
        lastKeys = Object.keys(allKeywords[key]);
      }
      lastKeys.forEach(function(kw){
        obj[kw] = key;
      })
    })
    return obj
  }
  
  function handleResponse(event){
    var dupBool = logEvent(event);
    if(dupBool){
      closeLog()
      return;
    }
    if(event.hasOwnProperty('bot_id')){
      closeLog()
      return;
    }
    var actionsObj 
    if(event.ccKLX){
      actionsObj = paths[event.ccKLX](channels,replies,event);
    }else{
      var keyword = detectCommand(event);
      var command = commandChart[keyword];
      if(command == 'giveAdogGIF' || command == 'thankYou'){
        actionsObj = GIPHY.getGIF(event,replies.GIPHYReplies[command],allKeywords[command][keyword])
      }else{
        say(event.channel,'hold on please..');
        switch(event.channel){
          case channels.comm.id:
            actionsObj = communityMGMT.isApprovedECommGroup(channels,replies,event)
            break;
          default:
            actionsObj = GIPHY.getGIF(event,replies.GIPHYReplies['giveAdogGIF'],allKeywords['giveAdogGIF']['dog'])
        }
      }
    }
    sayBulk(actionsObj);
    closeLog();
  }
  
  function detectCommand(event){
    var keywords = Object.keys(commandChart);
    var i = 0;
    var match;
    var keyword
    for(var i = 0; i < keywords.length; i++){
      keyword = keywords[i];
      match = event.text.indexOf(keyword);
      if(match != -1){
        return keyword;
      }
    }
  }
  
  function sayBulk(actionObj){
    var to = actionObj.to;
    var message = actionObj.messages;
    var isToArr = Array.isArray(to);
    var isMessageArr = Array.isArray(message);
    if(!isToArr && !isMessageArr){
      say(to,message);
    }else if(!isToArr && isMessageArr){
      message.forEach(function(messageP){
        say(to,messageP); 
      })
    }else if(isToArr && !isMessageArr){
      to.forEach(function(toP){
        say(toP,message); 
      })
    }else{
      to.forEach(function(toP){
        message.forEach(function(messageP){
          say(toP,messageP); 
        })
      })
    }
  }
  
  function say(channel,text){
    var payload = {token:SLACK_ACCESS_TOKEN, channel:channel, text: text};
    var response = UrlFetchApp.fetch(POST_MESSAGE_ENDPOINT, {method: 'post', payload:payload});
    logFileObj[event_id].response = response;
    Logger.log(response)
  }
  
  function logEvent(event){
    var dupBool = checkIfDuplicate(event);
    var date = new Date();
    event_id = date.toString();
    logFileObj[event_id] = event;
    return dupBool;
  }
  
  function checkIfDuplicate(event){
    if(event.client_msg_id){
      for(var eventKey in logFileObj){
        if(logFileObj[eventKey].client_msg_id == event.client_msg_id){
          return true
        }
      }
    }
    return false
  }
  function closeLog(){
    Toolkit.writeToJSON(logFileObj,EVENTS_LOGS_FILE_ID);
  }
  
  ferSlackBot.handleResponse = handleResponse;
  ferSlackBot.logEvent = logEvent;
  
  return ferSlackBot
  
})

function doPost(e){
  Logger.log(e)
//  return ContentService.createTextOutput(JSON.parse(e.postData.contents).challenge); //Challenge Line
  var event = JSON.parse(e.postData.contents).event;
  Logger.log('POST event: ' + JSON.stringify(event));
  ferSlackBot.handleResponse(event);
}
