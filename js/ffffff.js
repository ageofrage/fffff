window.onload = function(){

var body=document.getElementById("all");
var introduction=document.getElementById("introduction");
var questions=document.getElementById("questions");
var q2=document.getElementById("q2");
var q3=document.getElementById("q3");
var q4=document.getElementById("q4");
var q2key=document.getElementById("q2clear-key");
var q3key=document.getElementById("q3clear-key");
var q3pass=document.getElementById("q3pass");
var q3hint=document.getElementById("q3-hint");
var changeStyle=document.getElementById("change-style");

q2key.onclick=function(){
	if(q2.classList.contains("clear")){
		alert("変更済です");
	}else{
		q3hint.innerHTML="<p>推奨はchrome、IE10以上、firefoxです。全て使って下さい。</p>";
		body.style.color="black";
		introduction.style.fontSize="0.8em";
		questions.style.fontSize="0.9em";
		q2.classList.add("clear");
		q3.classList.remove("invisible")
		alert("【ご報告ありがとうございます】\n一部表示を変更しました");
	};
};

q3key.onclick=function(){
	if(q3pass.value==="ひらけ"){
		changeStyle.href="css/color.css";
		q4.classList.remove("invisible");
		q3.classList.add("clear");
		alert("【ご報告ありがとうございます】\n訂正しました");
	}else{
		alert("指摘が間違っているか、語順が間違っています");
	};
};


};
