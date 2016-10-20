docInfo = function(url, height, width, doc, purl){
    this.url        = url;
    this.height     = height;
    this.width      = width;
    this.time       = new Date().toString();
    this.doc        = "<html>" + doc + "</html>";
    this.children   = new Array();
    this.purl       = purl;
}

var port_doc    = chrome.runtime.connect({name : "document_data"});
var port_evnt   = chrome.runtime.connect({name : "event"});
var port_load   = chrome.runtime.connect({name : "load_complete"});
var port_search = chrome.runtime.connect({name : "search"});

var scriptWaitTime = 3000;
    
var evtInfo = function(url, type){
    this.url = url;
    this.type = type;
    this.time = new Date().toString();
}

function fnTransferEventToBackground(evtData){
    port_evnt.postMessage( { data:evtData } );
}

chrome.runtime.onMessage.addListener(//notification popup 창 위치 반환 핸들러 
    function(request, sender, sendResponse) {
    if (request.req_popup_location){
        sendResponse({
            left : window.screenX + window.outerWidth,
            top  : window.screenY
        });   
    }
});
