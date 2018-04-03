let player = null;
let LOAD_AMOUNT = 60;
let loading = false;
let canloadmore = true;
let stopped_at=0;
//let showingvid=false;
let load = function(){
   player = document.getElementById("player");
   let today = new Date();
   //document.getElementById("output").addEventListener("click", function(){ if(showingvid==true) closeVid(); });
   window.addEventListener("scroll",function(){
         if(document.body.scrollTop+document.documentElement.clientHeight>document.body.innerHeight-30||
         document.documentElement.scrollTop+document.documentElement.clientHeight>document.documentElement.scrollHeight-30)
            //console.log("true");
            if(loading==false&&canloadmore==true){
                loading=true;
                loadmore();
            }
            //else console.log("false");
         //console.log("innerHeight: " + document.documentElement.scrollHeight + " scrollTop:" + document.body.scrollTop + " " + (document.documentElement.scrollTop+document.documentElement.clientHeight));
    });
   document.getElementById("date").placeholder = today.getUTCFullYear()+"-"+(today.getUTCMonth()+1)+"-"+today.getUTCDate();
};

let currentIndex = 0;
let loaded = 0;
let index = 0;

let Video = function(html, _views, _game, name, _date, thumb, smallthumb){
    this.embed_html = html;
    this.game = _game;
    this.views = _views;
    this.creator_name = name;
    this.date = _date;
    this.thumbnail = thumb;
    //this.smallthumbnail = smallthumb;
};

let videos = [];
//console.log("TESTING");
let find = function(){
    loaded=0;
    stopped_at=0;
    canloadmore=true;
    let channel = document.getElementById("channelname").value.toLowerCase().trim();
    let user = document.getElementById("username").value.toLowerCase().trim();
    let date = new Date(document.getElementById("date").value);
    $("#output").html("");
    //$("#prev").css("display","none");
    //$("#next").css("display","none");
    $("#more").html("");
    //$("#player").html("");
    if(channel == "") {
        $("#output").text("Error: No channel provided");
        return;
    }
    if(document.getElementById("date").value!=""){
        if(!isValidDate(date)){
            $("#output").html("<p>Invalid date provided!");
            return;
        }
        else if(date.getUTCFullYear()<=2016&&date.getUTCMonth()<=04&&date.getUTCDate()<=25 ){//date clips were introduced
            $("#output").html("<p>Clips cannot be before 2016-5-26");
            return;
        }
    }
    $("#more").html("<img src='loading.gif' width='150' height='100'>");
    if(user == "")
    {
        let json = $.getJSON(channel + "_clips.txt", function(json) {
            for(let i=0; i<json.clips.length;i++){
                //for(let i=0; i<LOAD_AMOUNT;i++){
                let d = new Date(json.clips[i].created_at);
                if(document.getElementById("date").value==""||date.getUTCFullYear()==d.getUTCFullYear()&&date.getUTCMonth()==d.getUTCMonth()&&date.getUTCDate()==d.getUTCDate()){
                    videos[i] = new Video(json.clips[i].embed_html, json.clips[i].views, json.clips[i].game, json.clips[i].curator.display_name, json.clips[i].created_at, json.clips[i].thumbnails.tiny, json.clips[i].thumbnails.medium);
                    $("#output").append('<span class="container"><img onmouseenter="onOver(this)" height="147" width="260" onclick="View('+i+')" onmouseleave="onOut(this)" onerror="loadImage('+i+',this)" class="preview" src="'+json.clips[i].thumbnails.small+'" />\
                    <span class="desc"><br>Views: '+json.clips[i].views+' <br>'+json.clips[i].game+' <br>'+json.clips[i].curator.display_name+' <br>'+json.clips[i].created_at.substring(0,10)+'</span></span>');
                    loaded++;
                    if(loaded>=LOAD_AMOUNT) break;
                }
            }
        }).done(function(){
            console.log("loaded: "+ loaded);
        }).always(function(){
            if(loaded==0){
                if(date=="Invalid Date")
                    $("#output").html("<p>Invalid date provided.");
                else
                    $("#output").html("<p>Did not find any clips matching the results");
            }
            /*else if(loaded==LOAD_AMOUNT) {
                    $("#more").html('<input type="button" onclick="loadmore()" value="Load more">');
            }*/
            //console.log("date: " + date);
            $("#more").html("");
        }).fail(function() {
            $("#output").text("Channel does not exist.");
            console.log( "error" );
        });
    }
    else 
    {   
        let index = 0;
        let json = $.getJSON(channel + "_clips.txt", function(json) {
            for(let i=0; i<json.clips.length;i++){
                if(json.clips[i].curator.name==user){
                    let d = new Date(json.clips[i].created_at);
                    if(document.getElementById("date").value==""||date.getUTCFullYear()==d.getUTCFullYear()&&date.getUTCMonth()==d.getUTCMonth()&&date.getUTCDate()==d.getUTCDate()){
                        videos[index] = new Video(json.clips[i].embed_html, json.clips[i].views, json.clips[i].game, json.clips[i].curator.display_name, json.clips[i].created_at, json.clips[i].thumbnails.tiny, json.clips[i].thumbnails.medium);
                        $("#output").append('<span class="container"><img onmouseenter="onOver(this)" height="147" width="260" onclick="View('+index+')" onmouseleave="onOut(this)" onerror="loadImage('+index+',this)" class="preview" src="'+json.clips[i].thumbnails.small+'" />\
                        <span class="desc"><br>Views: '+json.clips[i].views+' <br>'+json.clips[i].game+' <br>'+json.clips[i].curator.display_name+' <br>'+json.clips[i].created_at.substring(0,10)+'</span></span>');
                        index++;
                        stopped_at=i+1;
                        if(index>=LOAD_AMOUNT) break;
                    }
                }
            }
        })
        .done(function(){
            if(index==0)
                $("#output").html("<p>No clips by '" + document.getElementById("username").value + "' found.</p>");
            /*else {
                $("#more").html("");
            }*/
        }).always(function(){
            if(index==0){
                if(document.getElementById("date").value!=""&&date=="Invalid Date")
                        $("#output").html("<p>Invalid date provided.");
                else
                    $("#output").html("<p>Did not find any clips matching the results");
            }
            $("#more").html("");
        })
        .fail(function() {
            $("#output").text("Channel does not exist.");
            console.log( "error" );
        });
    }
};

let loadImage = function(i, x){
    x.onerror=function(){console.log("could not load image");x.src="clips-404-320x180.png";}
    x.src=videos[i].thumbnail;
};

let prevVid = function(){
    if(currentIndex<=0) return;
        currentIndex--;
        View(currentIndex);
        console.log("prev");
};

let nextVid = function(){
        currentIndex++;
        View(currentIndex);
        console.log("next");
};

let loadmore = function(){
    $("#more").html("<img src='loading.gif' width='150' height='100'>");
    let user = document.getElementById("username").value.toLowerCase().trim();
    let channel = document.getElementById("channelname").value.toLowerCase();
    let date = new Date(document.getElementById("date").value);
    let loadOffset = loaded+LOAD_AMOUNT;
    if(user=="")
    {
        let json = $.getJSON(channel + "_clips.txt", function(json) 
        {
            for(let i=loaded; i<loadOffset;i++)
            {
                let d = new Date(json.clips[i].created_at);
                if(document.getElementById("date").value==""||date.getUTCFullYear()==d.getUTCFullYear()&&date.getUTCMonth()==d.getUTCMonth()&&date.getUTCDate()==d.getUTCDate()){
                    videos[i] = new Video(json.clips[i].embed_html, json.clips[i].views, json.clips[i].game, json.clips[i].curator.display_name, json.clips[i].created_at, json.clips[i].thumbnails.tiny, json.clips[i].thumbnails.medium);
                    $("#output").append('<span class="container"><img onmouseenter="onOver(this)" height="147" width="260" onclick="View('+i+')" onmouseleave="onOut(this)" onerror="loadImage('+i+',this)" class="preview" src="'+json.clips[i].thumbnails.small+'" />\
                    <span class="desc"><br>Views: '+json.clips[i].views+' <br>'+json.clips[i].game+' <br>'+json.clips[i].curator.display_name+' <br>'+json.clips[i].created_at.substring(0,10)+'</span></span>');
                    loaded++;
                }
            }
        }).done(function(){
            console.log("loaded: " + loaded);
            loading=false;
            if(loadOffset-loaded == LOAD_AMOUNT) canloadmore=false;
            $("#more").html("");
        }).fail(function(){
            $("more").css("display","none");
        });
    }
    else 
    {
        let oldIndex = index;
        let json = $.getJSON(channel + "_clips.txt", function(json) 
        {
            for(let i=stopped_at; i<json.clips.length;i++)
            {
                if(json.clips[i].curator.name==user)
                {
                    let d = new Date(json.clips[i].created_at);
                    if(document.getElementById("date").value==""||date.getUTCFullYear()==d.getUTCFullYear()&&date.getUTCMonth()==d.getUTCMonth()&&date.getUTCDate()==d.getUTCDate()){
                        videos[index] = new Video(json.clips[i].embed_html, json.clips[i].views, json.clips[i].game, json.clips[i].curator.display_name, json.clips[i].created_at, json.clips[i].thumbnails.tiny, json.clips[i].thumbnails.medium);
                        $("#output").append('<span class="container"><img onmouseenter="onOver(this)" height="147" width="260" onclick="View('+index+')" onmouseleave="onOut(this)" onerror="loadImage('+index+',this)" class="preview" src="'+json.clips[i].thumbnails.small+'" />\
                        <span class="desc"><br>Views: '+json.clips[i].views+' <br>'+json.clips[i].game+' <br>'+json.clips[i].curator.display_name+' <br>'+json.clips[i].created_at.substring(0,10)+'</span></span>');
                        index++;
                        stopped_at=i+1;
                        if(index>=oldIndex+LOAD_AMOUNT) break;
                    }
                }
            }
        }).done(function(){
            console.log("index: " + index);
            loading=false;
            //if(index%LOAD_AMOUNT-1==0) canloadmore=false;
            $("#more").html("");
        }).fail(function(){
            $("more").css("display","none");
        });
    }
};

let View = function(i){
    let clip = videos[i];
    currentIndex = i;
    if(clip==undefined){//load more clips
        loadmore();
    }
    else {
        console.log(clip);
        //$('html,body').scrollTop(0);
        //$("#prev").html('<div id="prevImg">')
        document.getElementById("prevImg").addEventListener("click", prevVid);
        player.innerHTML = '<div id="prevImg"></div><div id="nextImg"></div><img src="close-x.png" id="close" width="35" height="35"><div id="innerPlayer">'+clip.embed_html+'</div>';
        document.getElementById("close").addEventListener("click", closeVid);
        player.getElementsByTagName("iframe")[0].style.width ="800px";
        player.getElementsByTagName("iframe")[0].style.height ="500px";
        //$("#next").html('<div id="nextImg">')
        document.getElementById("nextImg").addEventListener("click", nextVid);
        let d = new Date(clip.date);
        $("#player").append('<span class="info">Views: '+clip.views+' <br>Game: '+clip.game+' <br>By: '+clip.creator_name+' <br>\
        Date: '+clip.date.substring(0,10)+/*'<br>Created at: '+d.getUTCHours()+':'+d.getUTCMinutes()+':'+d.getUTCSeconds()+'*/'</span></span>'); 
        $("#prevImg").css("display","inline");
        $("#player").css("display","block");
        $("#close").css("display","inline");
        $("#nextImg").css("display","inline");
        //setTimeout(function(){showingvid=true;},500);
    }
};

let closeVid = function(){
    $("#player").css("display","none");
    document.getElementById("innerPlayer").remove();
    //showingvid=false;
};

let isValidDate = function(d){
    if ( Object.prototype.toString.call(d) === "[object Date]" ) {
      if ( isNaN( d.getTime() ) ) {  // d.valueOf() could also work
        return false;
      }
      else {
        return true;
      }
    }
    else {
      return false;
    }
};

let onOver = function (x){
    x.style.opacity=0.7;
};

let onOut = function (x){
    x.style.opacity=1;
};
