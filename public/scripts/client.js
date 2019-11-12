function movepage(path) {
    location.href = path;
}

function refresh_timer() {
    setTimeout(function () {
        location.reload();
    }, 10 * 1000);
}

function chageSelect(){
    var categorySelect = document.getElementById("category");
    var sortSelect = document.getElementById("sort");
    var categoryselectText = categorySelect.options[categorySelect.selectedIndex].text;
    var sortSelectText = sortSelect.options[sortSelect.selectedIndex].value;
    console.log(sortSelectText);
    location.href =  "/?category=" + categoryselectText + "&sort=" + sortSelectText;
}

function limitTime(){
    var limit = document.getElementsByName("limittime");
    
    for(var i = 0; i < limit.length; i++){
        if(limit[i].attributes.value.value * 1 > 0){
            limit[i].attributes.value.value -= 1;
            minute = parseInt(limit[i].attributes.value.value / 60);
            second = limit[i].attributes.value.value % 60;
            if(second < 10)second = "0" + second;
            limit[i].innerHTML = minute + ":" +second;
        }
    }
    //console.log(limit[0].attributes.value);
    setTimeout("limitTime()",1 * 1000);
}

function printTime(){
    var clock = document.getElementById("clock");
    var now = new Date();
    
    clock.innerHTML = //now.getTime();
    
    now.getFullYear()+"년 " +
    (now.getMonth()+1)+"월 " +
    now.getDate()+"일\n" +
    now.getHours()+"시 " +
    now.getMinutes() +"분 "+
    now.getSeconds() + "초";

    setTimeout("printTime()",1 * 1000);
}

function categoryInit(){
    document.getElementById("category");
}

window.onload = function(){
    limitTime();
    printTime();
    // refresh_timer();
}

function newtopic_registered(){
    alert("게시글이 등록되었습니다.");
}

function poped(index){

    var topic = document.getElementById(index);
    var table = document.getElementById("table"+index);

    if(topic.style.maxHeight == "500px"){
        topic.style.animationName = "slideup";
        topic.style.maxHeight = "45px";
        table.style.visibility = "hidden";
    }
    else{
        topic.style.animationName = "slidedown";
        topic.style.maxHeight = "500px";
        table.style.visibility = "visible";
    }
}

function addcolumn(){

    var table = document.getElementById("table");
    var number = table.rows.length - 3;

    if(number <= 5){
        var row = table.insertRow(table.rows.length-2);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        console.log(row);

        row.childNodes[1].setAttribute('colspan','4');
        
        cell1.innerHTML = '선택' + number;
        var newinput = document.createElement('input');
        newinput.setAttribute('name', 'item'+number);
        newinput.setAttribute('type', 'text');
        newinput.setAttribute('requierd', 'requierd');
        newinput.setAttribute('autocomplete','off');
        newinput.setAttribute('placeholder', '추가 선택지를 입력하세요.');
        newinput.setAttribute('maxlength', '20');
        cell2.appendChild(newinput);
    }
    else{  
        alert("최대 5개의 선택지만 가능합니다.");
    }
}

function ssurbay(){

    var value = document.getElementById("intro-button").value;
    console.log(document.getElementById("intro-button").value);
    
    if(value === "SSURBAY"){
        document.getElementById("intro-button").value = "함께하기";
    }
        
    else{
        document.getElementById("intro-button").value = "SSURBAY";
    }
}

function test(e) {
    var input = document.getElementsByTagName
    var id = input[0]

    alert(id.value)
}