//描写は基本32px単位
//canvasの全体サイズは640□

"use strict";

//--------------------宣言部分--------------------//
//キャラクター動作変数・フラグ類
let motion=32,direction=96,dx=320,x=320,dy=576,y=576,i=-1,binMapX=10,binMapY=18,opData;
let stopFlg=false,mapFlg=false,battleFlg=false,endingFlg=false;
//戦闘変数・フラグ類
let hp=450,mp=23,point=0,choiceY=0,choiceX=0,refugeY=0,lastChoice=2;
let enemyFlg=false,damageFlg=false,changeTurnFlg=false,finishFlg=false,toggle=false;
//敵情報
let enemyHP=9999;
const enemyImg=new Image();
enemyImg.src="image/bigSaiyou.png";
//隠しコマンド
let passCode=[];
const secretCode=[38,38,40,40,37,39,37,39,66,65];

//キャラクターキャンバス
const spriteCanvas = document.getElementById("spriteCanvas");
const spriteCtx = spriteCanvas.getContext("2d");
const spriteImg = new Image();
spriteImg.src = "image/hiroshi.png?" + new Date().getTime();

//バッファーキャンバス（レンダリング用）
const buffCanvas = document.getElementById("buffCanvas");
const buffCtx = buffCanvas.getContext("2d");
buffCanvas.style.visibillity="hidden";

//マップキャンバス
const mapCanvas = document.getElementById("mapCanvas");
const mapCtx = mapCanvas.getContext("2d");
const mapImg = new Image();
mapImg.src = "image/map.png";

//メッセージウィンドウキャンバス
const messageCanvas = document.getElementById("messageCanvas");
const messageCtx = messageCanvas.getContext("2d");

//音声
const stageSound = new Audio("sound/stage.mp3");
const battleSound=new Audio("sound/battle.mp3");
const se=new Audio("sound/se.mp3");

//あたり判定マップ
const binMap =[
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

//テキストリスト
const dialogList= [
  "『つぎのかた、どうぞ』",
  "めんせつかん　があらわれた！",
  "ひろしは　あきらめた##なかよくしますか？#かえらせますか？",
  "めんせつかんと　なかよくなった！"
];

const parameterList=[
  "ひろし#HP: #MP:"
];

const commandList=[
  ["たたかう#わざ#どうぐ#にげる"],
  ["ひろしが　やるきをアピール！","めんせつかんに　２のダメージ！"],
  ["ポートフォリオ#VRめんせつ","そんなものはない","MPがたりない!"],
  ["ふつう めんきょしょう#こうしょさぎょうしゃ うんてんめんきょしょう","？『こういうものにはつかいどきがあるのじゃ』","こうしょさぎょうしゃうんてんめんきょしょうをみせた！#しかしわらわれてしまった！"],
  ["にげちゃダメだ"]
];

const enemyTurnList=[
  "めんせつかんは　わらっている","めんせつかんは　あっぱくめんせつをした！#ひろしに　８００００のダメージ！"
];


//--------------------クラス類--------------------//
//メッセージウインドウ（親）
class MessageWindow{
  constructor(winX,winY,winWidth,winHeight){
    this.winX=winX;
    this.winY=winY;
    this.winWidth=winWidth;
    this.winHeight=winHeight;
  };
    //ノーマルのメッセージウィンドウ
    open(text){
      //枠の描写
      messageCtx.clearRect(this.winX-4,this.winY-4,this.winWidth+8,this.winHeight+8);
      messageCtx.strokeStyle = "#FFF";
      messageCtx.lineWidth = "8";
      messageCtx.lineJoin = "round";
      messageCtx.strokeRect(this.winX,this.winY,this.winWidth,this.winHeight);
      //背景の描写
      messageCtx.fillStyle = "rgb(0,0,0)";
      messageCtx.fillRect(this.winX,this.winY,this.winWidth,this.winHeight);
      //文字の描写
      messageCtx.font="16px 'Terminal'";
      messageCtx.textAlign="left";
      messageCtx.fillStyle="rgb(255,255,255)";
      //文字列を分割
      let sentence=text.split("#");
      for (let line = 0; line <= sentence.length-1; line++) {
        messageCtx.fillText(sentence[line],this.winX+32,this.winY+32+(24*line));
        if(line===sentence.length-1){
          return line+1;
        };
      };
    };
    //パラメーター表示用
    parameter(hp,mp){
      messageCtx.font="16px 'Terminal'";
      messageCtx.fillStyle="rgb(255,255,255)";
      messageCtx.fillText(hp,this.winX+64,this.winY+56);
      messageCtx.fillText(mp,this.winX+64,this.winY+80);
    };
    //削除用
    clear(){
      messageCtx.clearRect(this.winX-4,this.winY-4,this.winWidth+8,this.winHeight+8);
    };
  };

  //バトルウインドウ（子）
class BattleWindow extends MessageWindow{
  constructor(winX,winY,winWidth,winHeight){
  super(winX,winY,winWidth,winHeight);
  };
  cursor(selection){
    messageCtx.clearRect(this.winX+1,this.winY,30,160);
    messageCtx.fillText("→",this.winX+1,this.winY+32+(24*selection));
  };
};

const dialog=new MessageWindow(10,480,620,150);
const battleBack=new BattleWindow(4,4,632,632);
const parameterWindow=new MessageWindow(20,20,110,110);
const commandWindow=new BattleWindow(20,460,600,160);
const opening=new MessageWindow(0,0,640,640);

//--------------------トランジション--------------------//
//渦巻きをつくる
const swirl=()=>{
  messageCtx.fillStyle="rgb(0,0,0)";
  let yCellF=-16;
  let fill=()=>{
    //支柱を描写
    if (yCellF<=640) {
      let xCell=320;
      if(yCellF<=320){
        messageCtx.fillRect(xCell-320,320-yCellF,16,16);
        messageCtx.fillRect(yCellF+304,xCell-320,16,16);
        messageCtx.fillRect(xCell+304,yCellF+304,16,16);
        messageCtx.fillRect(320-yCellF,xCell+304,16,16);
      };

      for(let yCellS=yCellF-16; yCellS>=-320; yCellS-=16){
        xCell+=16;
        //枝を描写
        if (yCellS>=0) {
          messageCtx.fillRect(xCell-320,320-yCellS,16,16);
          messageCtx.fillRect(yCellS+304,xCell-320,16,16);
          messageCtx.fillRect(304+(320-xCell)+320,yCellS+304,16,16);
          messageCtx.fillRect(320-yCellS,624+(320-xCell),16,16);
        };
      };
    };
  };
  //10msecで描写
  let timer=setInterval(function(){
    yCellF+=16;
    fill();
    if(yCellF>640){
      clearInterval(timer);
    };
  },10);
};


//--------------------初期読み込み--------------------//
window.onload =()=>{
  //開始画面文字
  opening.open("");
  messageCtx.font="64px 'Terminal'";
  messageCtx.fillStyle="rgb(255,255,255)";
  messageCtx.textAlign="center";
  messageCtx.fillText("転職クエスト",320,320);
  messageCtx.font="24px 'Terminal'";
  messageCtx.fillText("※音量注意",320,480);
  //ゲームスタート
  setTimeout(function(){
  messageCtx.clearRect(0,0,640,640);
  mapCtx.drawImage(mapImg,0,0,mapImg.width,mapImg.height);
  stageSound.play();
  stageSound.loop=true;
  dspSprite();
  },4000);
};


//--------------------マップ移動部分--------------------//
//歩行グラフィック：　歩行グラフィックの左右を入れ替える
const move =()=>{
  i=i*(-1);
  motion=motion*i+32;
};

//障害物検知
const obstacle=()=>{
  binMapX=dx/32;
  binMapY=dy/32;
  //0なら進む先に壁なし
  if (binMap[binMapY][binMapX]===0){
    mapFlg=false;
  //1なら壁あり
  }else if(binMap[binMapY][binMapX]===1){
    mapFlg=true;
  //canvas範囲外は不可
  }else if(binMapX>19 || binMapY>19 || binMapX<0 || binMapY<0 ){
    mapFlg=false;
  };
};

//移動・表示：　進む先の障害物の有無で変数を初期値に変換、キャンバスに描写
const dspSprite=()=>{
  //障害物があった場合、1歩もどす
  if(mapFlg){
    x=dx;
    y=dy;
  //障害物がなければ1歩進む
  }else if(!mapFlg){
    dx=x;
    dy=y;
  };
  buffCtx.clearRect(dx-32,dy-32,96,96);
  buffCtx.drawImage(spriteImg,motion,direction,32,32,dx,dy,32,32);
  opData=buffCtx.getImageData(0,0,buffCanvas.width,buffCanvas.height);
  spriteCtx.putImageData(opData,0,0);
};

//発火処理：　特定の場所で特定の行動のとき、会話イベント、戦闘イベント発生
const eventTrigger=()=>{
  if(((y/32===2 && x/32===9) || (y/32===2 && x/32===10)) && direction===96){
    se.play();
    stopFlg=true;
    dialog.open(dialogList[0]);
    battleFlg=true;
controller();
  };
};

//キー別動作：　押されたときの動作。スプライトを動かす。29:無変換(決定キーの役割),37:←,38:↑,39:→,40:↓
const keyDown=(event)=>{
  if(!stopFlg){
  switch(event.keyCode){
    case 37:
      direction=32;
      dx-=32;
    break;

    case 38:
      direction=96;
      dy-=32;
    break;

    case 39:
      direction=64;
      dx+=32;
    break;

    case 40:
      direction=0;
      dy+=32;
    break;
  };
  passCode.push(event.keyCode);
  if (passCode.toString().indexOf(secretCode)>=0){
    spriteImg.src="image/saiyou.png?" + new Date().getTime();
    passCode=[];
  };

  move();
  obstacle();
  dspSprite();
  };
};
//キーを離したときの動作。歩行グラフィックを正対する
//keydown,keyupで16pxずつ動かそうとしたが、衝突検知がめんどくさいのでシカト
const keyUp=(event)=>{
  if(!stopFlg){
  switch(event.keyCode){
    case 29:
      eventTrigger();
    break;

    case 37:
      direction=32;
    break;

    case 38:
      direction=96;
    break;

    case 39:
      direction=64;
    break;

    case 40:
      direction=0;
    break;
  };
  motion=32;
  dspSprite();
  };
};

//--------------------戦闘部分--------------------//
const battleMode=()=>{
  stageSound.pause();
  battleSound.play();
  battleSound.volume=0.3;
  battleSound.loop=true;
  swirl();
  setTimeout(function(){
  battleFlg=false;
  dialog.clear();//ダイアログをクリア
  battleBack.open("");//背景を描写
  messageCtx.drawImage(enemyImg,224,160,enemyImg.width,enemyImg.height);
  parameterWindow.open(parameterList[0]);//パラメーターウィンドウを開く
  parameterWindow.parameter(hp,mp);//パラメーターを更新
  commandWindow.open(dialogList[1]);//序文表示
  //コントローラー部分
  controller();
  },800);
};
//コマンドを表示する
const dspCommand=(choiceY,choiceX)=>{
  let choiceList=commandList[choiceY][choiceX];
  commandWindow.open(choiceList);
};
//全てのコマンドをリセット
const commandReset=()=>{
  battleFlg=false;
  enemyFlg=false;
  damageFlg=false;
  finishFlg=false;
  refugeY=0;
  choiceY=0;
  choiceX=0;
  point=0;
};
//方向キーを入力したときの動作
const battleCommand=(event)=>{
  let maxLine=commandWindow.open(commandList[choiceY][choiceX]);

  switch(event.keyCode){
    //コマンド初期化
    case 37:
      commandReset();
      dspCommand(choiceY,choiceX);
    break;

    case 38:
      point=((point-1)+maxLine)%maxLine;
    break;
    //選択肢が枝分かれしてる場合、refugeYに前選択を逃して、Xを選択する
    case 39:
      se.play();
      if(choiceY===2||choiceY===3){
        refugeY=choiceY;
      };

      choiceY=point+1;

      if(refugeY===2||refugeY===3){
        se.play();
        choiceX=choiceY;
        choiceY=refugeY;
      };
      point=0;

      if(choiceY===1){
        damageFlg=true;
        enemyFlg=true;
      }else if (choiceY===4||(choiceY===2&&choiceX>0)||(choiceY===3&&choiceX>0)){
        enemyFlg=true;
    };
      dspCommand(choiceY,choiceX);
    break;

    case 40:
      point=(point+1)%maxLine;
    break;
  };
  if(!damageFlg&&!enemyFlg){
    commandWindow.cursor(point);
  };
  controller();
};



//決定キーを押したときの挙動
const enterCommand=(event)=>{
  switch(event.keyCode){
  case 29:
  case 39:
    //敵ターン終了時の処理
    if(changeTurnFlg){
      changeTurnFlg=false;
      commandReset();
      dspCommand(0,0);
      commandWindow.cursor(point);
      controller();
    //相手ターンへ遷移
    }else if(!damageFlg){
      changeTurnFlg=true;
      commandWindow.open(enemyTurnList[0]);
    }else{
      //自ターンの相手へのダメージ処理
      if(damageFlg&&enemyHP>9991){
        damageFlg=false;
        dspCommand(1,1);
        enemyHP-=2;
      //相手HPが一定値を下回ったら、終了フラグをたてる
      }else if(enemyHP<=9991){
        se.play();
        commandWindow.open(dialogList[2]);
        finishFlg=true;
        commandWindow.cursor(lastChoice);
        controller();
      };
    };
  break;
  };
};

//戦闘終了フラグがたったときの処理
const finalize=(event)=>{
  finishFlg=false;
  switch(event.keyCode){
    case 38:
      lastChoice=2;
      commandWindow.cursor(lastChoice);
    break;

    case 29:
    case 39:
    //ひろしをなかまにする場合→エンディングへ
      if(lastChoice===2){
        se.play();
        battleSound.pause();
        commandWindow.open(dialogList[3]);
        commandReset();
        endingFlg=true;
        controller();
    //ひろしを帰らせた場合→自パラメーターダメージ処理後、フィールドマップへ
      }else if(lastChoice===3){
        commandWindow.open(enemyTurnList[1]);
        hp-=80000;
        if(hp<0){
          hp=0;
        };
        parameterWindow.clear();
        battleSound.pause();
        parameterWindow.open(parameterList[0])
        parameterWindow.parameter(hp,mp);
        //ボタンを押すたびに固定ダイアログを開く
        document.onkeydown=function(){
          toggle=!toggle;
          if(!toggle){
            se.play();
            dialog.open("うごかない。#たけだしんげん　のようだ。");
          }else{
            messageCtx.clearRect(0,0,640,640);
            dialog.clear();
          };
        };

      };
    break;

    case 40:
      lastChoice=3;
      commandWindow.cursor(lastChoice);
    break;
  };
};

//ゲームクリアした場合の処理
const ending=()=>{
  document.location.href="https://docs.google.com/forms/d/e/1FAIpQLSfONW-8eqho3KqQFvPZd9_lF3PT3z5E-SBbsoD51CbLiRtOgA/viewform";
};


//--------------------コントローラー部分--------------------//
//フィールドマップ探索中のコントローラー
if(!stopFlg){
  document.onkeydown=keyDown;
  document.onkeyup=keyUp;
};
//戦闘画面突入のコントローラー
let controller=()=>{
  if(battleFlg){
    document.onkeydown=function(event){
      if(event.keyCode===29){
        battleMode();
      };
    };
  //戦闘コマンド選択のコントローラー
  }else if(!enemyFlg&&!battleFlg&&!endingFlg&&!finishFlg){
    document.onkeydown=battleCommand;
  //戦闘コマンド決定のコントローラー
  }else if(enemyFlg&&!finishFlg){
    document.onkeydown=enterCommand;
  //終了フラグ時のyes,noコントローラー
  }else if(finishFlg){
    document.onkeydown=finalize;
  //エンディングへ導くコントローラー
  }else if(endingFlg){
    document.onkeydown=ending;
  };
};
