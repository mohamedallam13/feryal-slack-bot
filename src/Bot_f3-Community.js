;(function(root,factory){
  root.communityMGMT = factory()
})(this,function(){
  
  var communityMGMT = {};
  
  var channels,replies
  
  const ECOMMGROUP_APPROVED_FILE_ID = '1xomaUDOh-2vTtLPPJ3RLVSGoOR5WiuuT';
  
  function isApprovedECommGroup(channelNames,repliesList,event){
    channels = channels || channelNames;
    replies = replies || repliesList;
    var aprovedObj = Utils.getJSONData(ECOMMGROUP_APPROVED_FILE_ID);
    var message = event.text;
    var codes = Object.keys(aprovedObj);
    var code = isApproved(message,codes);
    if(code){
      return {to:channels.comm.name,message:Utils.createTemplateSimple(replies.comm.eCommCodeApproved,aprovedObj[code])};
    }
    return {to:channels.comm.name, message: "Nah..couldn't find this code", detected: false}
  }
  
  function isApproved(message,codes){
    for(var j = 0; j < codes.length; j++){
      if(message.indexOf(codes[j]) != -1){
        return codes[j];
      }
    }
    return null;
  }
  
  communityMGMT.isApprovedECommGroup = isApprovedECommGroup;
  
  return communityMGMT
  
})

function testIsApp(){
  const REPLIES_FILE_ID = '1R-Pl9LRj1-Pd7OV15befXV9UzyxHAyfz';
  var replies = Utils.getJSONData(REPLIES_FILE_ID);
  Logger.log(communityMGMT.isApprovedECommGroup(undefined,replies,{text: 'what about 123?'}));
}