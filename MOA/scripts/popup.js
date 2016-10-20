var userEmail = "-1";
var imgsrcccc = null;
var numOfItem = 20;
var numOfBubble = 20;
    flag      = true;
var numberOfSPage ;
var numberOfKeyword;
var bubbleList;
var snippetList;
var keywordList;
var orgSnippet;
var radiobtnID;
var STDWIDTH  = 1280;
var STDHEIGHT = 800;


function digitDateToString(str, type){
    var result = new Date();
    result.setFullYear(str.substr(0,4), parseInt(str.substr(4,2))-1, str.substr(6,2));
    if(type == "start"){
        result.setHours(0);
        result.setMinutes(0);
        result.setSeconds(0);
    }else if(type == "end"){
        result.setHours(23);
        result.setMinutes(59);
        result.setSeconds(59);
    }
    return result.toString();
}

function ReqDataToServer (){
    chrome.identity.getProfileUserInfo(function (userInfo) {
        var period = function(){
            this.start  =  digitDateToString($("#from").val(),"start");
            this.end    =  digitDateToString($("#to").val(),"end");
            this.userid =  userInfo.email;
        };
        //보내는 데이터
        var toSend = new period();
        numOfBubble = 20;
        $("#setBubbleNum").val("");
        
        
        //받는 데이터
        $.ajax({                //Send (docinfo) to server
            url : server_addr_snp,
            type : 'POST',
            async : true,
            dataType : 'json',
            data : {data : JSON.stringify(toSend)},
            error:function(request,status,error){
                var error = "<img src=\"images/error.png\" >";
                $("#warningMsg").html(error);
            },  
            success : function(data){                
                chrome.extension.sendRequest({SendBubbleData : true, data : data});
                chrome.extension.sendRequest({SendDateInfo   : true, 
                        radiobtnID  : radiobtnID, 
                        fromDate    : $("#from").val(), 
                        toDate      : $("#to").val()
                });
                fnReceiveBubbleData(data);
            }
        });// end ajax
    });
}

function fnReceiveBubbleData(data){
    
    $('#paginationSnippet').twbsPagination('destroy');
    $('#paginationBubble').twbsPagination('destroy');  
    var warning = "<img src=\"images/warning.png\" >";
    if(data == null){    
        $("#warningMsg").html(warning);
        numberOfKeyword = 0;
        document.getElementById("setBubbleNum").placeholder ="MAX : "+numberOfKeyword;
        return;
    }else if(data.bChart == null || data.bChart.children.length == 0){
        $("#warningMsg").html(warning);
        numberOfKeyword = 0;
        document.getElementById("setBubbleNum").placeholder ="MAX : "+numberOfKeyword;
        return;
    }else if(data.snippetList == null){
        $("#warningMsg").html(warning);
        numberOfKeyword = 0;
        document.getElementById("setBubbleNum").placeholder ="MAX : "+numberOfKeyword;
        return;
    }
    $("#warningMsg").html("");
    
    bubbleList = data.bChart;   
    
    snippetList = data.snippetList;    
    orgSnippet = $.extend(true,[],snippetList);
    
    //키워드 갯수,페이지 계산
    numberOfKeyword = bubbleList.children.length;
    document.getElementById("setBubbleNum").max =numberOfKeyword;
    document.getElementById("setBubbleNum").placeholder ="MAX : "+numberOfKeyword;

    var numberOfBPage = Math.ceil(numberOfKeyword / numOfBubble); 
    
    $('#paginationBubble').twbsPagination({
        totalPages: numberOfBPage,
        visiblePages: 5
    });

    makeView($("#paginationBubble .active").text());    
}

//var server_addr_snp = "http://210.118.74.183:8080/moa/receive/keyword";
var server_addr_snp = "http://210.118.74.183:8088/moa/receive/keyword";
function fnGetSnippet(resend){
    $("#bubble").html("");
    $("#snippetSpace").html("");
    
   
    chrome.identity.getProfileUserInfo(function (userInfo) {
        //사용자 정보
        userEmail = userInfo.email;
        a         = userEmail.indexOf("@");
        userEmail = userEmail.substring(0,a);
        $("#userID").html(userEmail+"님");
    });
    if(resend)  ReqDataToServer();
    else        chrome.extension.sendRequest({reqBubbleData : true}, function(response){
                    if(response.resBubbleData){
                        fnReceiveBubbleData(response.data);
                    }else{
                        ReqDataToServer();
                    }        
                });
    
}


window.onload= function(){
    
    chrome.identity.getProfileUserInfo(function (userInfo) {
        userEmail = userInfo.email;
        if(userEmail==undefined || userEmail==""){
             window.location.href="default.html";
             chrome.browserAction.setPopup({popup:"default.html"});
        }
      
        chrome.runtime.sendMessage({sender:"userEmail", email:userInfo.email});
          
    });
 
    //******************************************************************************
    // 상세검색 달력 스크립트
    //******************************************************************************
    
    
    
   
    $( "img.ui-datepicker-trigger" ).attr("style","margin-left:5px; vertical-align:middle; cursor:pointer;"); //이미지버튼 style적용
    $( "#ui-datepicker-div" ).hide(); //자동으로 생성되는 div객체 숨김  

    
    chrome.extension.sendRequest({reqDateInfo : true}, function(response){
        if(response.resDateInfo){
            radiobtnID = response.radiobtnID;
            
            if(response.fromDate == 0 || response.fromDate == "" ||
                    response.toDate  == 0 || response.toDate   == "" ){
                $("#from").val(settingDate(1));
                $("#to").val(settingDate(0));
                        
            }
            
            switch(radiobtnID){
            case 0 :
                $('#from').val(response.fromDate);
                $('#to')  .val(response.toDate);
                break;
            case 1 :
                $("input:radio[id='radio1']").attr("checked",true);
                break;
            case 2 :
                $("input:radio[id='radio2']").attr("checked",true);
                break;
            case 3 :
                $("input:radio[id='radio3']").attr("checked",true);
                break;
            }
            
            fnRadiobtnListener();
                
            //시작일
            $( "#from" ).datepicker({
                monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
                dayNamesMin: ['일','월','화','수','목','금','토'],
                weekHeader: 'Wk',
                numberOfMonths: 1,
                dateFormat: "yymmdd",
                showOn: "both",
                minDate: '-6m',
                maxDate: 0,
                buttonImage: "images/cale_bg.gif",
                buttonImageOnly: true,
                onSelect: function( selectedDate ) {
                   $("#to").val("");
                   $("#radio1").attr('checked', false); 
                   $("#radio2").attr('checked', false); 
                   $("#radio3").attr('checked', false); 

                   var option = this.id == "from" ? "minDate" : "maxDate",
                   instance   = $( this ).data( "datepicker" ),
                   date       = $.datepicker.parseDate(
                   instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
                   selectedDate, instance.settings );
                   jQuery( "#from,#to" ).not( this ).datepicker( "option", option, date );
                }
            });

            //종료일
            $( "#to" ).datepicker({
                monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
                dayNamesMin: ['일','월','화','수','목','금','토'],
                weekHeader: 'Wk',
                numberOfMonths: 1,
                dateFormat: "yymmdd",
                showOn: "both",
                minDate: $('#from').val(),
                maxDate: 0,
                buttonImage: "images/cale_bg.gif",
                buttonImageOnly: true,
                onSelect: function( selectedDate ) {
                   $("#radio1").attr('checked', false); 
                   $("#radio2").attr('checked', false); 
                   $("#radio3").attr('checked', false);      

                   radiobtnID = 0;
                   fnGetSnippet(true);
                }
            });
             
             
            fnGetSnippet(false);
        }     
    });

}



chrome.runtime.onMessage.addListener(function(message){
    if(message.sender == "background_std" && message.req_email){   //receive userEmail
        chrome.runtime.sendMessage({sender:"userEmail", email:userEmail});
    }
});


var date;
function settingDate(period){
    
    date = new Date();
    
    if(period == 1)        date.setDate(date.getDate() - 7);
    else if(period == 2)   date.setMonth(date.getMonth() - 1);
    else if(period == 3)   date.setMonth(date.getMonth() - 3);
    else if(period == 6)   date.setMonth(date.getMonth() - 6);
    
    var dd   = date.getDate();
    var mm   = date.getMonth()+1; //January is 0!
    var yyyy = date.getFullYear();  
        
    if(dd<10)   dd='0'+dd; 
    if(mm<10)   mm='0'+mm;
    
    date = yyyy.toString()+mm+dd;
    return date;
}
//0:오늘, 1:일주일전, 2:한달전, 3:3개월전

//var server_addr_search = "http://210.118.74.183:8080/moa/searching";
var server_addr_search = "http://210.118.74.183:8088/moa/searching";

function sendSearches(searches,check){
    
    $("#radio1").attr('checked', false); 
    $("#radio2").attr('checked', false); 
    $("#radio3").attr('checked', false); 

    chrome.identity.getProfileUserInfo(function (userInfo) {
        
        userid = userInfo.email;
        
        var SearchData = function(userid, searches){
        this.userid        = userid;
        this.searches     = searches;
        }
        
        //보내는 데이터
        var period = function(){
            this.start  = null;
            this.end    =  null;
            this.userid = userInfo.email;
        };
        
        var toSend = new period();
        var sd     = new SearchData(userInfo.email, searches);

        $.ajax({                //Send (tabout) to server
        url : server_addr_search,
        type : 'POST',
        async : true,
        dataType : 'json',
        data : {data : JSON.stringify(sd), date:JSON.stringify(toSend)},
        success : function(data){
                searches = data.keywords;
                var str = "";
                str += "- <font id=\"searchKey\">"
                str += searches;
                $('#paginationSnippet').twbsPagination('destroy');

                if (data.snippetList.length == 0)
                {
                    str += "</font> 에 대한 결과가 없습니다 -";
                    $("#searchResult").html(str);
                    $("#snippetSpace").html("");
                }
                else
                {
                    str += "</font> 에 대한 결과입니다 -"           
                    $("#searchResult").html(str);
                    snippetList=data.snippetList;
                    var position = $('#paginationBubble').offset(); // 위치값
                    $('html,body').animate({ scrollTop : position.top }, 200);
                    makeSnippet(1);
                }
            }// end
        });// end ajax 
    });
};

function fnRadiobtnListener(){
    if($("input:radio[id='radio1']").is(":checked"))
        $("#from").val(settingDate(1));
    else if($("input:radio[id='radio2']").is(":checked"))
        $("#from").val(settingDate(2));
    else if($("input:radio[id='radio3']").is(":checked"))
        $("#from").val(settingDate(3));
    
    $("#to").val(settingDate(0));
    $("#to").datepicker( "option", "minDate",  $('#from').val());
}

document.addEventListener('DOMContentLoaded',function(){ 
    fnRadiobtnListener();
    
    document.getElementById("radio1").addEventListener("click",function(){
        radiobtnID = 1;
        $("#from").val(settingDate(1));
        $("#to").val(settingDate(0));
        $("#to").datepicker( "option", "minDate",  $('#from').val());
                
        fnGetSnippet(true);
    });
    document.getElementById("radio2").addEventListener("click",function(){
        radiobtnID = 2;
        $("#from").val(settingDate(2));
        $("#to").val(settingDate(0));
        $("#to").datepicker( "option", "minDate",  $('#from').val());
                
        fnGetSnippet(true);
    });
    document.getElementById("radio3").addEventListener("click",function(){
        radiobtnID = 3;
        $("#from").val(settingDate(3));
        $("#to").val(settingDate(0));
        $("#to").datepicker( "option", "minDate",  $('#from').val());
                
        fnGetSnippet(true);
    });

    document.getElementById("paginationBubble").addEventListener("click",function(){
        var position = $('#searchForm').offset(); // 위치값
        $('html,body').animate({ scrollTop : position.top }, 200);
        snippetList = $.extend(true,[],orgSnippet);
        makeView($("#paginationBubble .active").text());
    });

    document.getElementById("paginationSnippet").addEventListener("click",function(){
        var position = $('#paginationBubble').offset(); // 위치값
        $('html,body').animate({ scrollTop : position.top }, 200);
        makeSnippet($("#paginationSnippet .active").text());
    });
    
   	$('img').error(function() {
        $(this).attr('src', "images/icon_128.png") 
    });
    
    $("#setBubbleNum").keypress(function (e){
        if(e.which == 13){
            if($("#setBubbleNum").val() >= numberOfKeyword)     $("#setBubbleNum").val(numberOfKeyword);
            if($("#setBubbleNum").val() == numOfBubble)         return;
            if($("#setBubbleNum").val())                        numOfBubble = $("#setBubbleNum").val();
            else                                                return;
            fnGetSnippet(false);
        }
    });

});

    
function makeView(pagenum){
    
    $("#searchResult").html("");
    $("#bubble").html("");
    
    var diameter = 390,
        format   = d3.format(",d"),
        color    = d3.scale.category20();

    var bubble = d3.layout.pack()
        .sort(null)
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#bubble").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");
    
    var tmp = $.extend(true,[],bubbleList);

    tmp.children = tmp.children.slice((pagenum-1)*numOfBubble,pagenum*numOfBubble);
    var maxindex = Math.min(numOfBubble, tmp.children.length) - 1;
    if(tmp.children[0].size - tmp.children[maxindex].size < 2){
        //수치가 너무 작을 때 원의 크기를 조정하기 위함
        //var adder = numOfBubble * seed;
        var adder = maxindex;
        for(var i  = maxindex; i >= 0; i--){
            var seed = (Math.random() * 10) % 5;
            if(adder > 0) tmp.children[maxindex-i].size *= adder;
            else break;
            adder -= seed;//adder*i;
        }    
    }

    //버블차트
    d3.json("", function(root) {   

        root=tmp;

        var node = svg.selectAll(".node")
            .data(bubble.nodes(classes(root))
            .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.className ; });

        node.append("circle") 
            .attr("r",0)
            .transition()
            .duration(function(d,i){return d.depth * 1000 + 500 ;})
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d,i) { return color(i); })
            .style("opacity",0.55);

        node.append("text")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className; })
            .style("font-size", function(d){ 
                var w = screen.width  / STDWIDTH;
                var h = screen.height / STDHEIGHT;
                var offset;
                if(w < 1 || h < 1)  offset = Math.max(w, h);
                else                offset = Math.min(w, h);
                return Math.min(d.r,( d.r / this.getComputedTextLength() * 7) * offset) + "px"; })
            .style("opacity",0)
            .transition()
            .duration(3000)
            .style("opacity",1.0)
            .attr("dy", ".35em");


        var fisheye = d3.fisheye.circular()
                        .radius(40)
                        .distortion(1)

        svg.on("mousemove", function () {
            fisheye.focus(d3.mouse(this));

            node.each(function (d) {
                d.fisheye = fisheye(d);
            });

            node.selectAll("circle")
                .attr("cx", function(d) { return d.fisheye.x - d.x; })
                .attr("cy", function(d) { return d.fisheye.y - d.y; })
                .attr("r",  function(d) { return d.fisheye.z * d.r; });

            node.selectAll("text")
                .attr("dx", function(d) { return d.fisheye.x - d.x; });

        });

        node.on("click", function(){
            var text = d3.select(this).text().substring(0,d3.select(this).text().length/2);
            sendSearches(text);    
        });
    });
    // Returns a flattened hierarchy containing all leaf nodes under the root.
    function classes(root) {
        var classes = [];

        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size});
        }

        recurse(null, root);
        return {children: classes};
    }
    d3.select(self.frameElement).style("height", diameter + "px");

    if($("#paginationSnippet .active").text())
        makeSnippet($("#paginationSnippet .active").text());
    else makeSnippet(1);
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