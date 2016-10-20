var userEmail = "-1";
var tokenn = -1;
window.onload=function () { 

    /* get google token */
    //버튼객체를 가져옴.

    var check = 0;
    
    //alert("asdfsdfsf");
    
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        tokenn = token;
        console.log("token : "+tokenn);
        if(tokenn == undefined){
            //window.location.href="default.html";
           chrome.browserAction.setPopup({popup:"default.html"});
            //console.log("token : "+tokenn);
            //alert("no token");
    }else{
            //console.log("token : "+tokenn);
            //alert("yes token");
          //  $("default").style.opacity = "0";
            window.location.href="popup.html";
            chrome.browserAction.setPopup({popup:"popup.html"});
           
         // window.location.href="popup.html";
        }
      
    });
    
    /* get url */
    var url;
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        url = tabs[0].url;
        console.log("url : "+url); 
    });   


    chrome.identity.getProfileUserInfo(function (userInfo) {
        console.log("email : " +  userInfo.email);
        console.log(userInfo.email);
        userEmail = userInfo.email;
       // alert(userEmail);
        if(userEmail==undefined || userEmail==""){
        // alert(userEmail);
         //window.location.href="default.html";
         chrome.browserAction.setPopup({popup:"default.html"});
        }
      
        //chrome.runtime.sendMessage({sender:"userEmail", email:userInfo.email});
          
    });/*
    alert(check);
    if(ckeck==1)
    {chrome.browserAction.setPopup({popup: "popup.html"});}
    else
    { chrome.browserAction.setPopup({popup: "default.html"});}*/

}



chrome.runtime.onMessage.addListener(function(message){
    if(message.sender == "background_std" && message.req_email){   //receive userEmail
        chrome.runtime.sendMessage({sender:"userEmail", email:userEmail});
    }
});

