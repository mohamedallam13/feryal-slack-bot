;(function(root,factory){
  root.postingLibrary = factory()
})(this,function(){
  
  var postingLibrary = {};
  
  const POSTING_TEAM_DAYS_FILE_ID = '17Vawm-kSS0mHnvmFTonK9fKtIdBV8PWy';
  
  var postingTeamDays = Toolkit.readFromJSON(POSTING_TEAM_DAYS_FILE_ID);
  
  var channels,replies
  
  function alertDelayPosting(channelNames,repliesList,event){
    channels = channels || channelNames;
    replies = replies || repliesList;
    var message = event.delay == 1? 'Hey guys, I noticed that we haven\'t posted anything since yesterday.' : 'Hey guys, I noticed that we haven\'t posted anything for ' + delay.toString() + ' days.';
    var assignedMemberId = postingTeamDays[event.weekday].id;
    var messagesArr = [message,"<@" + assignedMemberId + "|cal>" +  " is today your day?",'Can anyone please check this urgently? Thank you.']
    var actionsObject = {to: channels.posting.name,messages: messagesArr}
    
    return actionsObject;
  }
  
  postingLibrary.alertDelayPosting = alertDelayPosting;
  
  return postingLibrary
  
})