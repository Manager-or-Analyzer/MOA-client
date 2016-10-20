
var SearchResult = null;
var numOfItem = 20;
var snippetList;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request.snippet){
        SearchResult = request.SearchResult;
        snippetList = SearchResult.snippetList;

        var str = "";
        str += "- <font id=\"searchKey\">"
        str += SearchResult.keywords;
        $('#paginationSnippet').twbsPagination('destroy');
        str += "</font> 에 대한 결과입니다 -"           
        $("#searchResult").html(str);

        makeSnippet(1);        
    }
});

window.onload= function(){
    chrome.extension.sendRequest({snippet:true});
    
}

//스니펫
function makeSnippet(pagenum)
{    
    $("#snippetSpace").html("");
        
    for(var i=(pagenum-1)*numOfItem; i<(pagenum*numOfItem)-1; i++){
        if(snippetList.length <= i) break;
        var snippet=snippetList[i].snippet;
        var keyword=snippetList[i].keywordList;
        var keywords = "";
        var cnt = 0;

        for(var key in keyword){
            if(cnt < Object.keys(keyword).length &&  cnt <= 2 ) 
            {
                keywords +="<span style=\"padding:2px;margin-right:2px;";
                keywords += " font-size:";
                keywords += 17-(cnt*2);
                keywords += "px\">";
                keywords += Object.keys(keyword)[cnt++];
                keywords += "  </span>";           
            }
        }

        var date  = snippet.time;
        date = new Date(date);//.toString();
        date = date.toLocaleString();//.toString();

        var image = snippet.img ;
        var title = "no title";
        
        if(snippet.title)                                       title=snippet.title;
        if(image == undefined || image== null || image== "")    image = "images/icon_128.png";
        else if(image.charAt(0) == "/")                         image = "http:" + image;
        title = title.replace(/<|>/gi, "");
        
        var str = ""; 
        str += "<hr />";
        str += "<img src=\"";
        str += image;
        str += "\" alt=\"image\">";
        str += "<li >";
        str += "<ul class=\"snippet\" title=\"";
        str += date;
        str += " 에 방문하였습니다.\">";
        str += "<li><div class=\"title\"><a class=\"url\" href=\"";
        str += snippet.url;
        str += "\" target=\"_blank\" title=\"";
        str += title + "\">";
        str += title;
        str += "</a></div></li>";
        str += "<li class=\"keyword\" >";
        str += "<img src=\"images/keyword.png\" style=\"width: 15px;height: 15px; padding:2px;margin:0; margin-right:7px\" >";
        str += keywords;
        str += "</li>"

        $("#snippetSpace").append(str);
    }
    var numberOfSnippet = snippetList.length;
        numberOfSPage   = Math.ceil(numberOfSnippet / numOfItem);

    $('#paginationSnippet').twbsPagination({
        totalPages: numberOfSPage,
        visiblePages: 5
    });
}

document.addEventListener('DOMContentLoaded',function(){ 
        document.getElementById("paginationSnippet").addEventListener("click",function(){
        var position = $('body').offset(); // 위치값
        $('html,body').animate({ scrollTop : position.top }, 200);
        makeSnippet($("#paginationSnippet .active").text());
    });
    
});