{
/* get document infomation */
var intervalTime = 1000;
var delayTime = 3000;
var MAXWAITTIME = 10000;
var docflag = true;
var paurl;
var url;
var body = document.body,
    html = document.documentElement;
var completeflag = false;

var clock_id = null
var clock_ptr = -1
var clock_cur = -1

//setTimeout(function(){
    chrome.extension.sendRequest({taburl:true});    //request tab-url    
//}, 10000);


(
    function( $ ){
        // Default to the current location.
        var strLocation = window.location.href;
        var strHash = window.location.hash;
        var strPrevLocation = "";
        var strPrevHash = "";
        
        var intIntervalTime = 10;
        // This method removes the pound from the hash.
        var fnCleanHash = function( strHash ){
            return( strHash.substring( 1, strHash.length ) );
        }
        // check window location.
        var fnCheckLocation = function(){
            if (strLocation != window.location.href){
                // Store the new and previous locations.
                strPrevLocation = strLocation;
                strPrevHash = strHash;
                strLocation = window.location.href;
                strHash = window.location.hash;
                
                // console.log("address is changed");
                completeflag = false;
                chrome.extension.sendRequest({sender:"location_change"});
            }
        }
        setInterval( fnCheckLocation, intIntervalTime );
    }
)( jQuery, chrome );

    
/* check onload is complete */
function fnLoadComplete(param) {
    if (document.readyState === "complete") {
        clearInterval(clock_id);
        setTimeout(function(){
            if(completeflag)        return;         //return if already complete
            if(clock_cur != param)  return;         //page address is changed
            // console.log("load_complete");
            completeflag = true;
            port_load.postMessage({loc:paurl});
        }, delayTime);   //delay 3 seconds
    }
}

function fnSendDocument(){
    url = window.location.href;
    var rootdoc = new docInfo(url, 
                                Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ), 
                                $(window).width(), 
                                document.documentElement.innerHTML, 
                                paurl);
    // Send message to background
    // console.log("send document info\n");
    // console.log(rootdoc.doc);
    port_doc.postMessage({data:rootdoc});
    //if(editFlag) docflag = false;
    ++clock_cur;
    clock_id = setInterval(function(param){
        fnLoadComplete(param);
    }, intervalTime, ++clock_ptr);
    
    setTimeout(function(){      //load_complete가 되지 않는 페이지는 10초후 강제적으로 문서를 보낸다.
        if(completeflag)        return;    //return if already complete
        clearInterval(clock_id);
        completeflag = true;
        port_load.postMessage({loc:paurl});
    }, MAXWAITTIME);
}


var searchSite = /[\{\}\[\]\/?.,;:|\)*~`!^\-_<>@\#$%&\\\=\(\'\"]{1}((q\=)|(query\=))/;

function fnCheckSearches(url){
    var decURI = decodeURI(url);
    var searches;
    
    if(decURI.match(searchSite)){
        if(decURI.indexOf("http://cafe.daum.net/") != -1 )  return;
        var n = decURI.lastIndexOf("q=");
        var m  = decURI.lastIndexOf("query=");
                
        if(n != -1){      
            searches = decURI.substring(n+2);
            port_search.postMessage({data : searches});
        }else if(m != -1 ){
            searches = decURI.substring(m+6);
            port_search.postMessage({data : searches});
        }
    }
    
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request.taburl && docflag){
        docflag = false;
        paurl = request.parenturl;
        fnCheckSearches(paurl);
        setTimeout(function(){fnSendDocument();}, scriptWaitTime);
    }else if(request.loc_change){   //window addr is changed
        clearInterval(clock_id);
        paurl = request.parenturl;
        var pageout = new evtInfo(purl, "pageout");
        fnTransferEventToBackground(pageout);
        fnCheckSearches(paurl);
        setTimeout(function(){fnSendDocument();}, scriptWaitTime);
    }
});

}