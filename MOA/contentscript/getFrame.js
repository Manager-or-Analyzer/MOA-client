{

    
//frame을 보내지 않는 url을 걸러내기 위한 배열 
var ignoreURL = ["http://news.naver.com/"];
    
    
function fnSendFrame(){
    var subdoc = new docInfo(window.location.href, 
                    window.innerHeight, 
                    window.innerWidth, 
                    document.documentElement.innerHTML, 
                    paurl);
    // Send message to stdinfocollector.js:
    if(subdoc.purl != subdoc.url){          //getDocument.js와의 중복회피 
        //console.log("send frame info\n");
        //console.log(subdoc.doc);
        port_doc.postMessage({data:subdoc});
    }
    // set flag for no more send
    // if(editFlag)
    //     frameflag = false;
}

function fnIsIgnore(url){
    for(var i in ignoreURL){
       if(url.substring(0,ignoreURL[i].length) == ignoreURL[i]) return true;
    }
    return false;
}

var paurl;
var frameflag = true;        //if not send to background js flag is true;
            
chrome.extension.sendRequest({taburl:true});    //request tab-url    

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(frameflag && request.taburl){
        frameflag = false;
        paurl = request.parenturl;
        //3초 지연 후 문서 긁어온다.
        //ignoreURL이면 보내지 않는다.
        if(fnIsIgnore(paurl)) return;
        setTimeout(function(){fnSendFrame();}, scriptWaitTime);
    }else if(request.loc_change){   //window addr is changed
        paurl = request.parenturl;
        if(fnIsIgnore(paurl)) return;
        setTimeout(function(){fnSendFrame();}, scriptWaitTime);
    }
});

}