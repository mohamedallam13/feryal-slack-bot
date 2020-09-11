;(function(root,factory){
  root.groundteamLibrary = factory()
})(this,function(){
  
  var groundteamLibrary = {};
  
  var channels,replies
  
  function alertCurrentDocCount(channelNames,repliesList,event){
    channels = channels || channelNames;
    replies = replies || repliesList;
    var alertObj = event.alertObj;
    var docNames = Object.keys(alertObj);
    var message = docNames.length == 1? 'Guys, here are the update counts for the running form:\n' : 'Guys, here are the update counts for the running forms:\n'
    docNames.forEach(function(docName){
      message = message + docName + ': ' + alertObj[docName].count + '\n';
    })
    say('groundteam',message)
  }
  
  groundteamLibrary.alertCurrentDocCount = alertCurrentDocCount;
  
  return groundteamLibrary
  
})
