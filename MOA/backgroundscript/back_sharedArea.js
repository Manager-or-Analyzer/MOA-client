
var userEmail = "";
var PageListWithin24 = new Array();
var prev_searches = null;

var SearchData = function(userid, searches){
    this.userid       = userid;
    this.searches     = searches;
}
        
var period = function(start, end, userid){
    this.start  = start;
    this.end    = end;
    this.userid = userid;
};

var PageLog = function (url){
    this.url  = url;
    this.time = new Date();
}
function fnIsLogin(){
    if(userEmail == ""){
        //console.log("Please Login First");
        return false;
    }else return true;
}

var server_addr_stdinfo = "http://210.118.74.183:8088/moa/send/HTML";
//var server_addr_stdinfo = "http://210.118.74.183:8080/moa/send/HTML";
//var server_addr_stdinfo = "http://localhost:8080/moa/send/HTML";
function fnTransferStdinfo(docData){
    if( !fnIsLogin() ){
        alert("MOA - Please Login First");
        return;    //check login
    }                       
    if( !fnPageFilter(docData.url) )         return;    //check valid page
    if( !fnPageWithin24Hours(docData.url) )  return;      
    PageListWithin24.push(new PageLog(docData.url));    //add to 24-page-list
    
    BubbleData = null;
    //console.log("load_complete");
    //console.log(docData);
    $.ajax({                //Send (docinfo) to server
        url : server_addr_stdinfo,
        type : 'POST',
        async : true,
        dataType : 'json',
        data : {data : JSON.stringify(docData)},
        success : function(data){
            
            //console.log("data transfered to server : " + data);
        }// end
    });// end ajax
}

var server_addr_event = "http://210.118.74.183:8088/moa/send/Event";
//var server_addr_event = "http://210.118.74.183:8080/moa/send/Event";
//var server_addr_event = "http://localhost:8080/moa/send/Event";
function fnTransferEvent(evtData){
    if( !fnIsLogin() )                  return;             //check login
    if( !fnPageFilter(evtData.url) )    return;             //check valid page
    if( evtData.type == "drag" )        BubbleData = null;  //드래그이벤트 발생시 BubbleData재요청 
    //fnEventLogger(evtData);
    $.ajax({                //Send (tabout) to server
        url : server_addr_event,
        type : 'POST',
        async : true,
        dataType : 'json',
        data : {data : JSON.stringify(evtData)},
        success : function(data){
            //console.log("data transfered to server : " + data);
        }// end
    });// end ajax
}

var server_addr_search = "http://210.118.74.183:8088/moa/searching";
//var server_addr_search = "http://210.118.74.183:8080/moa/searching";
function passSearchKey(searches){
    if( !fnIsLogin() )              return; //check login
    var x = -1;
    x = searches.search(ignore);
    if(x != -1) searches = searches.substring(0,x);
    
    if(searches == prev_searches)   return; //이전검색어와 같은 검색어인지 확인 
    prev_searches = searches;
        
    //console.log("검색어 " + searches);
    var toSend = new period(null,null,userEmail);
    var sd     = new SearchData(userEmail,searches);

    $.ajax({                //Send (tabout) to server
        url   :   server_addr_search,
        type  :   'POST',
        async :   true,
        dataType :  'json',
        data     :   {data : JSON.stringify(sd), date:JSON.stringify(toSend)},
        success  :   function(data){
            if(data.snippetList.length == 0) return;
            else                             fnNoti(data);
            
            //console.log(data);
        }// end
    });// end ajax 
};

function fnPageWithin24Hours(url){
    var flag = true;
    var currentTime = new Date();
    for(var i in PageListWithin24){
        if( currentTime - PageListWithin24[i].time > 1000 * 60 * 60 * 24 ) {
            PageListWithin24.splice(i--,1); continue;
        }
        if( PageListWithin24[i].url == url) flag = false;
    }
    return flag;
} 

function fnPageFilter(url){
    if(typeof url === "undefined" || typeof url.match === "undefined" ){
        return false;
    }
    if(url.match(searchSite)){//q,query를 포함하는 url 일 때,       
        if(url.indexOf("http://cafe.daum.net/") != -1)  return true;//다음카페면 filtering 안함                   
        return false; //나머지는 filtering함
    }
    else if(url.match(ignoreMainSite)){
        fnRexLogger("no");    
        return false;}//메인사이트 filtering
    else if(!urlMatchInArray(url))        return false;//그 밖의 사이트 filtering        
    else                                  return true;
}

function urlMatchInArray(url){
        
    if(url.match(ignoreSite))                                                   {fnRexLogger("no1");   return false;}
    if(url.match(chromeSite))                                                   {fnRexLogger("no2");   return false;}
    if(url.match(readSite))
        if(url.indexOf("read") == -1 && url.indexOf("newsRead") == -1)          {fnRexLogger("no3");   return false;}
    if(url.match(detailSite))
        if(url.indexOf("/detail") == -1)                                        {fnRexLogger("no4");   return false;} 
    if(url.match(contentsSite))
        if(url.indexOf("contents") == -1)                                       {fnRexLogger("no5");   return false;}
    if(url.match(articleSite))
        if(url.indexOf("article") == -1)                                        {fnRexLogger("no6");   return false;}
    if(url.indexOf("blog.daum.net") != -1 && url.indexOf("t__nil_navi") != -1)  {fnRexLogger("no7");   return false;}
    if(url.match(viewSite))
        if(url.indexOf("view.do") == -1)                                        {fnRexLogger("no8");   return false;}
    fnRexLogger("ok");
    return true;
}



function fnEventLogger (evtData){
    if(evtData.type == "pagein"){
        console.log("pagein : " + evtData.url + "\n");
    }else if(evtData.type == "pageout"){
        console.log("pageout : " + evtData.url + "\n");
    }else if(evtData.type == "scroll"){
        console.log("scroll : " + evtData.url + "\n(" + evtData.x + ", "+ evtData.y + ")");
    }else if(evtData.type == "drag"){
        console.log("drag : " + evtData.url + "\n" + evtData.data);
    }else if(evtData.type == "tabin"){
        console.log("tabin : " + evtData.url + "\n");
    }else if(evtData.type == "tabout"){
        console.log("tabout : " + evtData.url + "\n");
    }
}

var BubbleData = null;
var radiobtnID = 1;
var fromDate = 0;
var toDate = 0;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.reqBubbleData){
        if(BubbleData == null){
            sendResponse({resBubbleData : false});
        }else{
            sendResponse({resBubbleData : true,  data:BubbleData });
        }
    }else if(request.SendBubbleData){   //bubbledata갱신  
        BubbleData = request.data;
    }else if(request.reqDateInfo){
        sendResponse({resDateInfo : true,  radiobtnID:radiobtnID, fromDate:fromDate, toDate:toDate });
    }else if(request.SendDateInfo){
        radiobtnID  = request.radiobtnID;
        fromDate    = request.fromDate;
        toDate      = request.toDate;
        
    }
});

//검색어 가져오는 정규식

function fnRexLogger(type){
/*    if(type == "no")        console.log("no");
    else if(type == "no1")  console.log("no1");
    else if(type == "no2")  console.log("no2");
    else if(type == "no3")  console.log("no3");
    else if(type == "no4")  console.log("no5");
    else if(type == "no6")  console.log("no6");
    else if(type == "no7")  console.log("no7");
    else if(type == "no8")  console.log("no8");
    else if(type == "ok")   console.log("ok");*/
}



var ignore = /[\{\}\[\]\/?.,;:|\)*~`!^\-_<>@\#$%&\\\=\(\'\"]/gi;
var ignoreMainSite = /^(((http(s?))\:\/\/)?)(([0-9a-zA-Z\-]|([ㄱ-힣]))+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?\/?$/;
var ignoreSite =/^((http(s?))\:\/\/)((me\.naver\.com\/index\.nhn)$|(((cafe)|(blog))((\.naver\.com)|(\.daum\.net))(\/([0-9a-zA-Z\-]|([._])|([ㄱ-힣]))*\/?)$)|(terms\.naver\.com\/list\.nhn)|((section\.blog)|(section\.cafe)|(moneybook)|(newsstand)|(book)|(tvcast)|(openlectures)|(novel)|(music)|(mail)|(calendar)|(image\.search)|(memo)|(office)|(contact)|(photo\.cloud)|(map)|(nid))(\.naver\.com)|(www\.google\.co((\.kr)|m)\/((webhp)|(doodles)$|(culturalinstitute)|(adsense)|(\?gfe)|(imghp\?)))|(((mail)|(myaccount)|(translate)|(photos)|(drive)|(plus)|(adwords)|(news))(\.google\.co((\.kr)|m)))|(www.facebook.com)|((mail2)|(addrbook)|(top\.cafe)|(member)|(shopping)|(map)|(login))(\.daum\.net)|(twitter\.com)|(ups.surveyrouter.com)|(www.daum.net)|(nielsenwebsurveys.com)|(www.panel.co.kr)|(kr.m.aipsurveys.com)|(panel.aipsurveys.com)|(surveys.ipsosinteractive.com)|(baykoreans.net)|(www.dailymotion.com))/;
var articleSite = /^((http(s?))\:\/\/)(imnews.imbc.com)/;
var viewSite = /^((http(s?))\:\/\/)(news.kbs.co.kr)/;
var readSite = /^((http)\:\/\/)((entertain\.naver\.com)|(sports\.news\.naver\.com)|(finance\.naver\.com)|(news\.naver\.com)|(info\.finance\.naver\.com))/;
var detailSite = /^((http)\:\/\/)(((kin)|(|[a-zA-Z]*(dic))\.naver\.com))/;
var contentsSite = /^((http)\:\/\/)(navercast\.naver\.com)/;
var chromeSite = /^(chrome)/;
var searchSite = /[\{\}\[\]\/?.,;:|\)*~`!^\-_<>@\#$%&\\\=\(\'\"]{1,}((q\=)|(query\=))/;
