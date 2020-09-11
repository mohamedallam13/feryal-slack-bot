;(function(root,factory){
  root.GIPHY = factory()
})(this,function(){
  
  var GIPHY = {}
  
  const GIPHY_API_KEY = 'PrO8422CAkfa0eD9K9A5QTW1n7KQ2kS7';
  const GIPHY_END_POINT = 'http://api.giphy.com/v1/gifs/search?q=';
  
  function getGIF(event,replies,keywordsArr){
    var channel = event.channel;
    var user = event.user;
    var response = getGiphyUrl(keywordsArr,replies);
    var randomText = Math.floor(Math.random() * replies.length);
    var message = "<@" + user + "|cal>"  + replies[randomText] + '\n' + response;
    return {to: channel,messages: message}
  }
  
  function getGiphyUrl(keywordsArr){
    var url = GIPHY_END_POINT + keywordsArr.join('%20') + '&api_key=' + GIPHY_API_KEY;
    var response = JSON.parse(UrlFetchApp.fetch(url));
    var random_params = Math.floor(Math.random() * response.data.length);
    return response.data[random_params].bitly_gif_url;
  }
  
  GIPHY.getGIF = getGIF;
  
  return GIPHY
  
})