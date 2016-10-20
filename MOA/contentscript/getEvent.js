{
var charLimit = 200;
    
/* getURL */
var purl;
var evtflag = false;

chrome.extension.sendRequest({tab_url_for_event:true});
chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(!evtflag && request.tab_url_for_event){
        purl = request.url;
		evtflag = true;
		//console.log("purl : "+purl+"\n");
        fnPageinEvent();
    }else if(request.loc_change){   //window addr is changed
        purl = request.parenturl;
        fnPageinEvent();
    }
});

function fnPageinEvent(){
    if(purl === url){
        var pagein = new evtInfo(purl, "pagein");
        fnTransferEventToBackground(pagein);
    }    
}

var url = window.location.href;

/////////////////////////////////////////////
    function enableTextSelection(){
        function ats(){
            var styles = '*,p,div,table,tbody,span,a,h1,h2,h3,h4,h5,h6,br,li,td,article,blockquote { user-select:text !important;-moz-user-select:text !important;-webkit-user-select:text !important;}';
            jQuery('head').append(jQuery('<style />').html(styles));
            var allowNormal = function(){return true;};
            jQuery('*[onselectstart], *[ondragstart], *[oncontextmenu], #enableTestSelectMOA')
                .unbind('contextmenu')
                .unbind('selectstart')
                .unbind('dragstart')
                .unbind('mousedown')
                .unbind('mouseup')
                .unbind('click')
                .attr('onselectstart',allowNormal)
                .attr('oncontextmenu',allowNormal)
                .attr('ondragstart',allowNormal);
                
            /*
            var all_elements = document.getElementsByTagName('*');
            var elemt;
            var i;
            for(i = 0; i < all_elements.length; i++){
                elemt = all_elements[i];
                $(elemt)
                    .unbind('contextmenu')
                    .unbind('selectstart')
                    .unbind('dragstart')
                    .unbind('mousedown')
                    .unbind('mouseup')
                    .unbind('click')
                    .attr('onselectstart',allowNormal)
                    .attr('oncontextmenu',allowNormal)
                    .attr('ondragstart',allowNormal);
            }
            */
            
            
        }
        function atswp(){
            if(window.jQuery){
                ats();
            }else{
                window.setTimeout(atswp,100);
            }
        }
        
        if(window.jQuery){
            ats();
        }else{
            var s = document.createElement('script');
            s.setAttribute('src','http://code.jquery.com/jquery-1.9.1.min.js');
            document.getElementsByTagName('body')[0].appendChild(s);
            atswp();
        }
    }
/*
jQuery.fn.enableTextSelect = function() {
	return this.each(function() {
		$(this).css({
			'MozUserSelect':'',
			'webkitUserSelect':''
		}).attr('unselectable','off').unbind('selectstart');
	});
};
*/


function J(K){
    if(!K){
        return;
    }
    if(K.oncontextmenu){K.oncontextmenu=null;}
    if(K.ondragstart){K.ondragstart=null;}
    if(K.ondragend){K.ondragend=null;}
    if(K.onselectstart){K.onselectstart=null;}
    if(K.onmousedown){K.onmousedown=null;}
    if(K.onmouseup){K.onmouseup=null;}
    if(K.onbeforecopy){K.onbeforecopy=null;}
    if(K.onbeforecut){K.onbeforecut=null;}
    if(K.oncopy){K.oncopy=null;}
}
function l(I){
    var K=document.getElementsByTagName(I);
    var e;
    for(var J=0;J<K.length;J++){
        e=K[J];
        e.oncontextmenu = null;
        e.ondragstart = null;
        e.ondragend = null;
        e.onselectstart = null;
    }
}
function G(){
    J(document);
    J(document.body);
    J(window);
    l("img");
    l("td");
    //J()
}


    


/* page in */
$(window).ready(function(){
    //enable text selecting  
    setInterval(G(), 100);
    enableTextSelection();
});
/* page out */
window.onbeforeunload = function() {
    if(purl === url){
        var pageout = new evtInfo(purl, "pageout");
        fnTransferEventToBackground(pageout);
        // console.log("pageout : " + purl + "\n");
	}
};
/* tab change --> eventCollector.js */


/* scroll Event */
var lastScrollTime = new Date(2000,1,1,1,1,1,1);
$(window).scroll(function(){
    var currentTime = new Date();
    if( (currentTime - lastScrollTime) < 1000 ) return; //1초 이내 스크롤은 무시  
    lastScrollTime = currentTime;  
    //horizontal scroll
    var scrollevent = new evtInfo(purl, "scroll");
    scrollevent.x = document.body.scrollLeft;
    scrollevent.y = document.body.scrollTop;
    
    fnTransferEventToBackground(scrollevent);
    
    // console.log("scroll : " + purl + "\n");
    // console.log("(x, y) : (" + scrollevent.x  + ", ", scrollevent.y + ")\n");
    
});

/* drag event */
$(window).dblclick(function(){
    if( !isValidDrag() ) return;
    var dragevnt = new evtInfo(purl, "drag");
    dragevnt.data = window.getSelection().toString();
    fnTransferEventToBackground(dragevnt);
            
    // console.log("select contents : " + window.getSelection().toString() + "\n");
});

var cur_pos_x;
var cur_pos_y;
var down_pos_x;
var down_pos_y;
var up_pos_x;
var up_pos_y;
$(window).mousemove(function( event ) {
    cur_pos_x = event.pageX;
    cur_pos_y = event.pageY;      
});
$(window).mousedown(function(){
    down_pos_x = cur_pos_x;
    down_pos_y = cur_pos_y;
});
$(window).mouseup(function(){
    up_pos_x = cur_pos_x;
    up_pos_y = cur_pos_y;
    
    var horizontal_gap = Math.abs(up_pos_x - down_pos_x);
    var vertical_gap = Math.abs(up_pos_y - down_pos_y);
//    if(vertical_gap > 100) return;                      //ignore drag if gap is more than 100px   //(deprecated - use charLimit)
    if(vertical_gap + horizontal_gap < 2) return;                   //ignore just click
    if( !isValidDrag() ) return;
        
    var dragevnt = new evtInfo(purl, "drag");
    dragevnt.data = window.getSelection().toString();
            
    fnTransferEventToBackground(dragevnt);
                
    // console.log("drag contents : " + window.getSelection().toString() + "\n");
});


function isValidDrag(){
    if(window.getSelection().toString().length >= charLimit) return false;  //ignore if length over charLimit
    if(window.getSelection().toString().length == 0)         return false;  //ignore if length over charLimit
    if(window.getSelection().toString() == null)             return false;  //ignore if " "
    if(window.getSelection().toString() == "")               return false;  //ignore if ""
    if(window.getSelection().toString() == " ")               return false;  //ignore if ""
    if(window.getSelection().toString() == "\n")             return false;  //ignore if "\n"
    if(window.getSelection().toString() == ".")              return false;  //ignore if "."
    if(window.getSelection().type !== "Range")               return false;  //ignore drag if not text area
    return true;
}



}