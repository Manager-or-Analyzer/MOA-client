{   
(
    function(){
        var loginDetector = function(){
            chrome.identity.getProfileUserInfo(function (userInfo) {
                userEmail = userInfo.email;
                if(userEmail == ""){    //logout됨 
                    BubbleData = null;                    
                }
            });
        }
        setInterval( loginDetector, 1000 );
    }
)();
    
var docInfo = function(url, height, width, doc, purl){
    this.url        = url;
    this.height     = height;
    this.width      = width;
    this.time       = new Date().toString();
    this.doc        = doc;
    this.children   = new Array();
    this.purl       = purl;
}

/* HashMap 객체 생성 */
var StdInfoMap = function(){
    this.map = new Object();
}
 
StdInfoMap.prototype = {
    put :           function (key, value) { this.map[key] = value; },   // key, value 값으로 구성된 데이터를 추가 
    get :           function (key) { return this.map[key]; },           // 지정한 key값의 value값 반환 
    containsKey :   function (key) { return key in this.map; },         // 구성된 key 값 존재여부 반환 
    containsValue : function (value) {                                  // 구성된 value 값 존재여부 반환 
                        for (var prop in this.map) {
                            if (this.map[prop] == value) return true;
                        }
                        return false;
                    },
    clear :         function () {                                       // 구성된 데이터 초기화 
                        for (var prop in this.map) {
                            delete this.map[prop];
                        }
                    },
    remove :        function (key) { delete this.map[key]; },           // key에 해당하는 데이터 삭제 
    keys :          function () {                                       // 배열로 key 반환 
                        var arKey = new Array();
                        for (var prop in this.map) {
                            arKey.push(prop);
                        }
                        return arKey;
                    },
    values :        function () {                                       // 배열로 value 반환 
                        var arVal = new Array();
                        for (var prop in this.map) {
                            arVal.push(this.map[prop]);
                        }
                        return arVal;
                    },
    size :          function () {                                       // Map에 구성된 개수 반환 
                        var count = 0;
                        for (var prop in this.map) {
                            count++;
                        }
                        return count;
                    }
}

function MutexWaitMap() {
    this.map  = new Object();
    // Map API
    this.add     = function(k,v){ this.map[k] = v; }
    this.remove  = function( k ){ delete this.map[k]; }
    this.get     = function( k ){ return k==null ? null : this.map[k]; }
    this.first   = function(   ){ return this.get( this.nextKey( ) ); }
    this.next    = function( k ){ return this.get( this.nextKey(k) ); }
    this.nextKey = function( k ){ 
        for (var i in this.map) {
            if (!k) return i;
            if (k == i) k = null;    //tricky
        }
        return null;
    }
}

function Mutex( cmdObject, methodName ) {
    // define static variable and method
    if (!Mutex.Wait) Mutex.Wait = new MutexWaitMap();
    Mutex.SLICE = function( cmdID, startID ) {
        Mutex.Wait.get(cmdID).attempt( Mutex.Wait.get(startID) );
    }
    // define instance method
    this.attempt = function( start ) {
        for (var j=start; j; j=Mutex.Wait.next(j.cmdObj.id)) {
            if (j.enter || (j.number && (j.number < this.number ||
                    (j.number == this.number && j.cmdObj.id < this.cmdObj.id) ) ) )
            return setTimeout("Mutex.SLICE("+this.cmdObj.id+","+j.cmdObj.id+")",10);
        }
        this.cmdObj[ this.methodID ]();    //run with exclusive access
        this.number = 0;              //release exclusive access
        Mutex.Wait.remove( this.cmdObj.id );
    }
    // constructor logic
    this.cmdObj   = cmdObject;
    this.methodID = methodName;
    Mutex.Wait.add( this.cmdObj.id, this );    //enter and number are
                                          //"false"
    this.enter    = true;
    this.number   = (new Date()).getTime();
    this.enter    = false;
    this.attempt( Mutex.Wait.first() );
}

function StdCmd(message) {
    if (!StdCmd.NextID) {                   //define class variable
        StdCmd.NextID = 0;
    }
    this.id      = ++StdCmd.NextID;         //define instance variable
    this.message = message;
    if(StdCmd.NextID > 10000) StdCmd.NextID = 0;
    
    this.DocData = function (){
        if( message.data.purl == message.data.url ){ //루트문서 
            var rootdoc = message.data;
            docTree.put(rootdoc.url, rootdoc); //doc tree에 삽입
        }else{ //sub 문서
            if( docTree.containsKey(message.data.url) ) return; //root문서와 동일한 문서 check
            var subdoc = message.data;
            if( docTree.containsKey(subdoc.purl) ){
                var target  = docTree.get(subdoc.purl);
                var addFlag = true;
                for(var i in target.children){
                    if(target.children[i].url == subdoc.url){
                        addFlag = false;
                        break;    
                    } 
                }
                if(addFlag)
                    docTree.get(subdoc.purl).children.push(subdoc);
            }else //docTree에 아직 루트가 없다면 큐에서 대기, load_complete때 다시 한번 검사 
                docQueue.push(subdoc); 
        }
    }

    this.LoadCpl = function () {
        // console.log("page load complete\n" + message.loc);
        var complete_doc = docTree.get(message.loc);
        if(typeof complete_doc === "undefined"){
            // console.log("Page closed before load complete\n");
            return;
        }
            
        for(var i in docQueue){
            if(docQueue[i].purl == complete_doc.url){
                var isContain = false;
                for(var j in complete_doc.children){
                    if(complete_doc.children[j].url == docQueue[i].url){
                        isContain = true;
                        break;
                    } 
                }
                if(!isContain) complete_doc.children.push(docQueue[i]);
                docQueue.splice(i,1);   //delete element
                i--;
            }
        }            
        //console.log(complete_doc);
        
        fnTransferStdinfo(complete_doc);
        
        docTree.remove(message.loc);    
    }

    this.PageOut = function () {
            for(var i in docQueue){                         //delete pages in docQueue which is engaged closed page
                if (docQueue[i].purl == message.location){
                    docQueue.splice(i,1);
                    i--;
                }else if((new Date()) - (new Date(docQueue[i].time)) > lastTime){   //remove timeout entry
                    docQueue.splice(i,1);
                    i--;
                }
            }
            var docTreeArr = docTree.values();
            for(var i in docTreeArr){
                if((new Date()) - (new Date(docTreeArr[i].time)) > lastTime){    //remove timeout entry
                    docTree.remove(docTreeArr[i].url);
                }
            }
            if(docTree.containsKey(message.location)){      //if docTree have entry, remove it
                docTree.remove(message.location);
            }
    }
}

var docQueue   = new Array();           //document 대기열 자료구조
var docTree    = new StdInfoMap();      //document tree 자료구조
var enterQueue = new Array();           //document 입력 자료구조
var lastTime   = 12000;                  //time that remain in data struct

function processDocData (message){ new Mutex(new StdCmd(message), "DocData"); }
function processLoadCpl (message){ new Mutex(new StdCmd(message), "LoadCpl"); }
function processPageOut (message){ new Mutex(new StdCmd(message), "PageOut"); }

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(chrome.runtime.lastError){
        console.log("Exception : already processed tab");    
    }else if(typeof sender.tab === "undefined"){
        //nothing to do
        //request from extension it self
    }else if(request.taburl){
        chrome.tabs.sendRequest(sender.tab.id, { taburl:true,     parenturl:sender.tab.url });
    }else if(request.sender == "location_change"){
        chrome.tabs.sendRequest(sender.tab.id, { loc_change:true, parenturl:sender.tab.url });
    }
});


(//Garbage Collector
    function (){
        var fnGarbageCollector = function(){    //remove timeout entry in each data struct
            for(var i in enterQueue){                        
                if((new Date()) - (new Date(enterQueue[i].time)) > 60000){
                    enterQueue.splice(i,1);
                    i--;
                }
            }
            for(var i in docQueue){                        
                if((new Date()) - (new Date(docQueue[i].time))   > lastTime){
                    docQueue.splice(i,1);
                    i--;
                }
            }
            var docTreeArr = docTree.values();
            for(var i in docTreeArr){
                if((new Date()) - (new Date(docTreeArr[i].time)) > lastTime){    
                    docTree.remove(docTreeArr[i].url);
                }
            }
        }
        setInterval( fnGarbageCollector, 1000);
    }
)( enterQueue, docQueue, docTree );

(//EntryAdder
    function(){
        var fnEntryAdder = function(){
            var i = -1;
            while(enterQueue[++i]){
                var doc = enterQueue[i];
                if( enterQueue[i].purl == enterQueue[i].url ){ //루트문서 
                    doc.userid = userEmail;
                    docTree.put(doc.url, doc); //doc tree에 삽입
                }else{ //sub 문서
                    if( docTree.containsKey(doc.purl) ){
                        var target  = docTree.get(doc.purl);
                        var addFlag = true;
                        for(var j in target.children){
                            if(target.children[j].url == doc.url){
                                addFlag = false;
                                break;    
                            } 
                        }
                        if(addFlag)
                            docTree.get(doc.purl).children.push(doc);
                    }else //docTree에 아직 루트가 없다면 큐에서 대기, load_complete때 다시 한번 검사 
                        docQueue.push(doc); 
                }
                //enterQueue.splice(i,1);
                //i--;
            }
        }
        setInterval( fnEntryAdder, 10 );
    }
)( enterQueue, docQueue, docTree );

chrome.runtime.onConnect.addListener(function(port){
    if(port.name == "document_data"){
        port.onMessage.addListener(function(message){
            enterQueue.push(message.data);
        });
    }else if(port.name == "load_complete"){
        port.onMessage.addListener(function(message){
            processLoadCpl(message);
        });
    }else if(port.name == "pageout"){
        port.onMessage.addListener(function(message){
            //nothing to do
            //job will processed by Garbage collector
        });
    }else if(port.name == "search"){
        port.onMessage.addListener(function(message){
            passSearchKey(message.data);
        });
    }/*else if(port.name == "userEmail"){                   //deprecated
        port.onMessage.addListener(function(message){
            userEmail = message.email;
            console.log(userEmail);
        });
    }*/
});

chrome.runtime.onMessage.addListener(function(message){
    if(message.sender == "userEmail"){   //receive userEmail
        userEmail = message.email;
    }else if(message.sender == "logout"){
        userEmail = "-1";
    }
});

}