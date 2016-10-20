{
var evtQueue = new Array();
    
var evtInfo = function(url, type){
    this.url = url;
    this.type = type;
    this.time = new Date().toString();
}    

function fnTabChange(){
    if(prev_tabid != -1){   //except initial page
        chrome.tabs.get(prev_tabid, function (tab){
            if(chrome.runtime.lastError){
            }else{
                var tabout = new evtInfo(tab.url, "tabout");        //tabout_event
                tabout.userid = userEmail;
                
                fnTransferEvent(tabout);
            }
        });
            
    }
    
    chrome.tabs.get(actv_tabid, function (tab){
        if(chrome.runtime.lastError){
            prev_tabid = -1;
            actv_tabid = -1;
            return;
        }     
        var tabin = new evtInfo(tab.url, "tabin");        //tabin_event
        tabin.userid = userEmail;
        
        fnTransferEvent(tabin);

    })
}



//send parentURL to content script    
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(chrome.runtime.lastError){
        //console.log("Exception : already closed tab");    
    }else if(typeof sender.tab === "undefined"){
        //console.log(sender);
        //console.log("undefined");
    }else if(request.tab_url_for_event){
        chrome.tabs.sendRequest(sender.tab.id, { tab_url_for_event:true, url:sender.tab.url });
    }
});

/* tab change  */
var prev_tabid = -1; //init as -1
var actv_tabid = -1;

chrome.tabs.onActivated.addListener(function (activeInfo){
    actv_tabid = activeInfo.tabId;
    fnTabChange();
    prev_tabid = activeInfo.tabId;
});

chrome.windows.onFocusChanged.addListener(function(windowid){
    if(windowid > 0){
        chrome.tabs.query({"active" : true}, function(result){
           for(var i in result){
               if(result[i].windowId == windowid){
                   actv_tabid = result[i].id;
                   break;
               }
           }
           fnTabChange();
           prev_tabid = actv_tabid; 
        });
    }
});


(
    function(){
        var fnEventProcessor = function(){
            var evntData;
            while( (evntData = evtQueue.shift()) ){
                evntData.userid = userEmail;     //assign user id
                fnTransferEvent(evntData);
            }
        }
        setInterval( fnEventProcessor, 1000 );
    }
)( evtQueue );


chrome.runtime.onConnect.addListener(function(port){
    if(port.name == "event"){
        port.onMessage.addListener(function(message){
            evtQueue.push(message.data);
        });
    }
});

}