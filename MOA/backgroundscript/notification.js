var SearchResult = null;
var popupWidth  = 390;
var popupHeight = 600;
    
function fnNoti(data){
    SearchResult = data;
    
    var option_ = {
        icon : "images/icon_128.png",
        body : "에 대한 검색기록이 존재합니다."
    }
    
    var noti = new Notification(data.keywords, option_);
    setTimeout(noti.close.bind(noti), 4000);
    noti.onclick = function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, 
            {req_popup_location : true}, 
            function(response) {
                if(typeof response == "undefined") return;    //already created notification popup
                chrome.windows.create({   
                    type    :   "popup", 
                    url     :   "popup2.html", 
                    width   :   popupWidth, 
                    height  :   popupHeight,
                    left    :   response.left - popupWidth,
                    top     :   response.top
                });    
            });  
        });
        noti.close();
    }
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(chrome.runtime.lastError){
        console.log("Exception : already processed tab");    
    }else if(typeof sender.tab === "undefined"){
        //nothing to do
        //request from extension it self
    }else if(request.snippet){
        chrome.tabs.sendRequest(sender.tab.id, { snippet:true,     SearchResult:SearchResult });
    }
});