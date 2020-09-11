;(function(root,factory){
  root.moderationLibrary = factory()
})(this,function(){
  
  var moderationLibrary = {};
  
  var channels,replies
  
  function criticalPostAlert(channelNames,repliesList,event){
    channels = channels || channelNames;
    replies = replies || repliesList;
    var rootMessage = event.alertPosts.length < 2? 'Hey mods, heads up. I am sensing a problem with these posts' : 'Hey mods, heads up. I am sensing a problem with this post';
    var posts = event.alertPosts.join('\n');
    var message = rootMessage + '\n' + posts;
    var messagesArr = [message,'Can anyone please check this urgently?']
    var actionsObject = {to: channels.mod.name,messages: messagesArr}
    
    return actionsObject;
  }
  
  moderationLibrary.criticalPostAlert = criticalPostAlert;
  
  return moderationLibrary
  
})