class UserData {
  constructor(userid) {
      this.userid = userid;
      this.createDate = new Date();
      this.data = [];
      this.ready = false;
  }
  check(event) {
      if (!this.ready) {
          event.reply(myQuestions[this.data.length][0]);
          this.ready = true;
      } else {
          var message = [];
          message.push(myQuestions[this.data.length][1]);
          this.data.push(event.message.text);
          if (this.data.length != totalSteps) {
              message.push(myQuestions[this.data.length][0]);
          } else {
              this.data.splice(0, 0, this.createDate);
              appendMyRow(this.data);
              let data = find(users, "userid", event.source.userId);
              fireBaseCollector.addUser(event.source.userId,this.data[4]);
              users.splice(data[1], 1);
             bot.push(lineid, "您已成功註冊!\nID:" + user + "\n註冊ID：" + lineid);   
          }
          event.reply(message);
         
      }
  }
}
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var linebot = require('linebot');
var express = require('express');
var getJSON = require('get-json');
var people_num = 0;
const bodyParser = require('body-parser');
const fireBaseCollector = require('./FireBaseCollector.js');
const path = require('path');
const clientSocket = {};
const io = require('socket.io');

_getWeather();

//LINE deploy_info
var bot = linebot({
  channelId: '1611184250',
  channelSecret: 'fc0dde92ef9e9b182bc526a240c18346',
  channelAccessToken: 'fo/507dPjAsjw/gAjXcas2aKo94L9l5QOLrDqTkQ6fcsy5lDv4uRGAGHd0ck8DAumYuGVRYO9pNMJXWrcohw/2KnyeD0XJ1y2fW7fdgfpzmd5ChC5KuAV9REP9kFNlFubCii5jKuSVY81oDn3KTvRwdB04t89/1O/w1cDnyilFU='
});

var myClientSecret = {
  "installed": {
      "client_id": "583651028506-fvmng0ph5iesllm8jifa3s7j0lorvvof.apps.googleusercontent.com",
      "project_id": "coral-smoke-218120",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://www.googleapis.com/oauth2/v3/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_secret": "gBtSIM6stlySHqzQIbVXuMFI",
      "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
  }
}

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(myClientSecret.installed.client_id, myClientSecret.installed.client_secret,
  myClientSecret.installed.redirect_uris[0]);

//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials = {
  "access_token": "ya29.GlsyBqOC4eCB5NPDgl9nOYJhPLFGuJDJbMA2INQF9Umh-ZLYXWtb6QTFUGN-DdAxuQM5Bgi36IYLKV9IrNiMql1zWQcJYansuRGUagfTna5xBCckyXmXM2b5CgQo",
  "refresh_token": "1/cSQDIaLXFErKVfdT2-DH0ADjMSIU1L2QKFfgLWZpnKk",
  "scope": "https://www.googleapis.com/auth/spreadsheets",
  "token_type": "Bearer",
  "expiry_date": 1539199944860
}

//試算表的ID，引號不能刪掉
var mySheetId = '1xI2UxdRH0AJd2h5t0LcW66SjLOrZ3RiBcRMz1zEzd64';

var myQuestions = [];
var users = [];
var totalSteps = 0;
var myReplies = [];

//程式啟動後會去讀取試算表內的問題
getQuestions();


//這是讀取問題的函式
function getQuestions() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
      auth: oauth2Client,
      spreadsheetId: mySheetId,
      range: encodeURI('q'),
  }, function (err, response) {
      if (err) {
          console.log('load API q：' + err);
          return;
      }
      var rows = response.values;
      if (rows.length == 0) {
          console.log('No data found.');
      } else {
          myQuestions = rows;
          totalSteps = myQuestions.length;
          console.log('您的問題已經下載完畢');
      }
  });
}

//這是將取得的資料儲存進試算表的函式
function appendMyRow(data) {
  var request = {
      auth: oauth2Client,
      spreadsheetId: mySheetId,
      range: encodeURI('shtees1'),
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      resource: {
          "values": [data]
      }
  };
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.append(request, function (err, response) {
      if (err) {
          console.log('The API returned an error: ' + err);
          return;
      }
  });
}
var go = '正常';
var wt = [];
var ps = [];
var timer;
var buttonsImageURL_N = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Northern_Taiwan_official_determined.svg/240px-Northern_Taiwan_official_determined.svg.png';
var buttonsImageURL_M = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Central_Taiwan_official_determined.svg/240px-Central_Taiwan_official_determined.svg.png';
var buttonsImageURL_S = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Southern_Taiwan_official_determined.svg/240px-Southern_Taiwan_official_determined.svg.png';
var buttonsImageURL_E = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Eastern_Taiwan_official_determined.svg/240px-Eastern_Taiwan_official_determined.svg.png';
var buttonsImageURL_F = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Fujian_Province_in_Taiwan_%28special_marker%29.svg/240px-Fujian_Province_in_Taiwan_%28special_marker%29.svg.png';
var userlist = (fireBaseCollector.getUsers());
var JustGps = {
"type": "location",
"title": "景文科技大學",
"address": "231新北市新店區安忠路99號",
"latitude": 24.9534475,
"longitude": 121.5070476
}
bot.on('message', function (event) {
function _getStatus() {
  // clearTimeout(timer);
  getJSON('https://XXX.XXX.airXb.io/api/v1/sensors/sensorD/2018-12-09/helmet', function (error, response, endstatus) {
    var output = JSON.stringify(response.results);
    console.log(output);
    var locations = response.results['0000000012345691']['locations'];//取location's Data
    var locationlastOne = locations[locations.length - 1];//最新一筆資料
    // console.log(locations[0].lat, locations[0].lng);//第一筆資料
    var latt = locationlastOne.lat;
    var lngg = locationlastOne.lng;
    // console.log(latt, lngg);//最新一筆資料 (北緯,東經)


    var Status = response.results['0000000012345691']['angles'];
    var StatuslastOne = Status[Status.length - 1];
    var anglee = StatuslastOne.angle;
    var statuss = StatuslastOne.status;
    // console.log(anglee, statuss);
    if (statuss == "00") {
      go = '正常';
    }
    else {
      go = '異常';
    }

    var Temperatures = response.results['0000000012345691']['temperatures'];
    var TemperatureslastOne = Temperatures[Temperatures.length - 1];
    var temperaturee = TemperatureslastOne.temperature;
    var timee = TemperatureslastOne.time;
    var localtime = new Date(timee);
    localtime.setHours(localtime.getHours() + 8);
    var localtimee = localtime.toLocaleString();
    console.log(temperaturee, timee);
    endstatus = ('人員編號:0000000012345691' + '\n' + '定位-北緯,東經 : ' + (latt) + ', ' + (lngg) + '\n' + '體溫 : ' + (temperaturee) + '°Ｃ' + '\n' + '傾角 : ' + (anglee) + '\n' + '狀態 : ' + (go) + '\n' + '更新時間 : ' + (localtimee));//+ '\n' + 'time : ' + (timee)
    bot.push(lineid, endstatus);
    console.log(endstatus);
    return endstatus;
    // return endstatus;
  });
}
var checkin = new Boolean(false);
var replyMsg = '';
var Q = 0;
var vv = '';
var news1 = "一、遵守「人離火熄」原則\n1.使用瓦斯時，人不可遠離火源。常常有人因接電話、臨時離開等狀況而忘了瓦斯仍在燃燒，因此釀成遺憾。\n2.夜間睡覺時應關閉瓦斯開關。\n3.如果外出，短時間內不用瓦斯，應將瓦斯總開關關閉，避免瓦斯洩漏。"
var news2 ="二、使用瓦斯器具時\n1.鍋內煮湯或燒開水時，不要裝太滿，以免火被滿出來的湯水澆熄而漏氣。\n2.在點火時，如果連續幾次沒點著，先關閉開關，等到漏出的瓦斯散去，才可再點火。\n3.瓦斯爐具要經常保養、清潔、檢查，以免發生漏氣或堵塞的現象。"

var news5 =("五、其他注意事項\n1.使用合格之瓦斯器具及鋼瓶。\n2.檢查瓦斯容器有無容器檢驗卡、容器是否逾期未檢。\n3.經常檢查瓦斯開關、橡皮管等，有無鬆動、破損。\n4.出遠門時，或睡覺前，牢記關瓦斯開關。\n5.使用瓦斯時，人不可遠離，萬一失火始可迅速發現，及時搶救。\n6.煮湯或燒水時，不要裝太滿，以免火被溢出的湯、水澆熄，而產生漏氣。\n7.已用完液化石油氣之空瓶，應注意將瓶上開關關閉，以免瓶內殘餘液體流出，引起危險。")
console.log(event);
event.source.profile().then(function (profile) {   //Loading Firebase message json for reply.
  user = profile.displayName;
  let requestMessage = event.message.text;
  let lineid = event.source.userId;
  let data = find(users, "userid", lineid);
  if (data) {
      data[0].check(event);
  } else {
  if (requestMessage.indexOf("我要報名") >= 0) {
    let checkuser = fireBaseCollector.getUserByLineId(lineid);
    if (!checkuser) {
          var userData = new UserData(lineid);
          userData.check(event);
          users.push(userData);
          
      }
      else {
        bot.push(lineid, "您已註冊過,ID：" + (user));
    }
    console.log(fireBaseCollector.getUserByLineId(lineid));
          return;
      }
  else  if (requestMessage == "氣爆注意事項") {
    while(no>6){
      let no='0'
      switch(no){
   case"no=0"
      bot.push(lineid,news1);
       no=no+1;
       break;
   case"no=1"
      bot.push(lineid,news2);
      no=no+1; 
      break;
   case"no=2"
      bot.push(lineid,news5);
      no=no+1;
     break;
    }}
  }
  else if (requestMessage == "當前人數") {
    bot.push(lineid, "目前有" + (people_num) + "人");
  }
  else if (requestMessage == "我要註冊") {

    let checkuser = fireBaseCollector.getUserByLineId(lineid);
    if (checkuser) {
      bot.push(lineid, "您已註冊過,ID：" + (user));
    }
    else {
      bot.push(lineid, "您已成功註冊!\nID:" + user + "\n註冊ID：" + lineid);
      fireBaseCollector.addUser(lineid, user);
    }
    console.log(fireBaseCollector.getUserByLineId(lineid));
  }
else if (requestMessage == "移除使用者"){
  let checkuser = fireBaseCollector.getUserByLineId(lineid);
    if (checkuser) {
      bot.push(lineid, "已將您移除：" + (user));
  fireBaseCollector.removeUser(lineid);
    }
  else {
     bot.push(lineid, "無此使用者ID：" + (user));
  }
  }
  else if (requestMessage == "天氣資訊") {
    bot.push(
      lineid,
      {
        type: 'template',
        altText: '天氣資訊清單',
        template: {
          type: 'carousel',
          columns: [
            {
              thumbnailImageUrl: buttonsImageURL_N,
              imageSize: 'contain',
              imageAspectRatio: 'rectangle',
              title: '氣象資訊',
              text: '北部',
              actions: [
                { label: '中央氣象局', type: 'uri', uri: 'https://www.cwb.gov.tw/V7/forecast/' },
                { label: '臺北', type: 'message', text: '臺北天氣' },
                { label: '宜蘭', type: 'message', text: '宜蘭天氣' },
              ],
            },
            {
              thumbnailImageUrl: buttonsImageURL_M,
              imageSize: 'contain',
              imageAspectRatio: 'rectangle',
              title: '氣象資訊',
              text: '中南部',
              actions: [
                { label: '臺中', type: 'message', text: '臺中天氣' },
                { label: '玉山', type: 'message', text: '玉山天氣' },
                { label: '日月潭', type: 'message', text: '日月潭天氣' },
              ]
            },
            {
              thumbnailImageUrl: buttonsImageURL_S,
              imageSize: 'contain',
              imageAspectRatio: 'rectangle',
              title: '氣象資訊',
              text: '中南部',
              actions: [
                { label: '嘉義', type: 'message', text: '嘉義天氣' },
                { label: '臺南', type: 'message', text: '臺南天氣' },
                { label: '高雄', type: 'message', text: '高雄天氣' },
              ]
            },
            {
              thumbnailImageUrl: buttonsImageURL_E,
              imageSize: 'contain',
              imageAspectRatio: 'rectangle',
              title: '氣象資訊',
              text: '東部',
              actions: [
                { label: '花蓮', type: 'message', text: '花蓮天氣' },
                { label: '臺東', type: 'message', text: '臺東天氣' },
                { label: '蘭嶼', type: 'message', text: '蘭嶼天氣' }
              ]
            },
            {
              thumbnailImageUrl: buttonsImageURL_F,
              imageSize: 'contain',
              imageAspectRatio: 'rectangle',
              title: '氣象資訊',
              text: '外島',
              actions: [
                { label: '澎湖', type: 'message', text: '澎湖天氣' },
                { label: '金門', type: 'message', text: '金門天氣' },
                { label: '馬祖', type: 'message', text: '馬祖天氣' }

              ]
            },
          ],
        },
      }
    );
  }
  else if (requestMessage.indexOf('天氣') != -1) {
    wt.forEach(function (e, i) {
      if (requestMessage.indexOf(e[0]) != -1) {
        replyMsg = e[0] + ' 天氣' + '\n' + '天氣狀況 : ' + e[1] + '\n' + '溫度 : ' + e[2] + ' °C' + '\n' + '能見度 : ' + e[3] + ' 公里' + '\n' + '海平面氣壓 : ' + e[4] + ' mbar' + '\n' + '風速 : ' + e[5] + ' 公尺/秒' + '\n' + '風向 : ' + e[6] + '\n' + '日累積雨量 : ' + e[7] + ' 毫米' + '\n' + '更新時間 : ' + e[8];
        event.reply(replyMsg);
      }
    });
    if (replyMsg == '') {
      replyMsg = '抱歉, 找不到這個地點, 請輸入其它地點';
      event.reply(replyMsg);
    }
  }

  else if (requestMessage == "個人資訊") {
    _getStatus();
  }
  else if (requestMessage == "所在位置") {
    bot.push(lineid, JustGps);
  }
  else if (requestMessage == "南港國宅氣爆案") {
    bot.push(lineid,'https://news.ltn.com.tw/news/society/breakingnews/2935656');
  }
  else {
    bot.push(lineid, "我看不懂你說的[ " + requestMessage + " ]");
  }

  
}});//Loading Firebase message json for reply.
});

const app = express();
app.post('/', bot.parser());
app.get('/', function (req, res) {
res.sendfile(__dirname + '/views/index.html');
});
app.post('/data', [bodyParser.json(), bodyParser.urlencoded({ extended: false })], function (req, res) {
let reqJson = req.body;
if (!reqJson.TYPE) {
  res.status(501).send('Bad Request');
  return;
}
switch (reqJson.TYPE) {
  case "QUERY":
    let users = fireBaseCollector.getUsers();
    let sendData = [];
    users.forEach(function (e) {
      sendData.push({ NAME: e.NAME, NUMBER: e.NUMBER, PASSWORD: e.PASSWORD, LINEID: e.LINEID, BIND: e.BIND });
    });
    res.send(sendData);
    break;
  case "ADD":
    fireBaseCollector.addUser(reqJson.DATA.NAME, reqJson.DATA.NUMBER, reqJson.DATA.PASSWORD);
    res.sendStatus(200);
    break;
  case "REMOVE":
    fireBaseCollector.removeUser(reqJson.USER.BIND);
    if (reqJson.USER.LINEID) {
      let data = find(joinList, "LINEID", reqJson.USER.LINEID);
      if (data) {
        joinList.splice(data[1], 1);
        broadcast("online", { TYPE: "REMOVE", LINEID: reqJson.USER.LINEID });
        bot.getUserProfile(reqJson.USER.LINEID).then(function (profile) {
          let d = { LINEID: reqJson.USER.LINEID, NAME: profile.displayName };
          unknowjoinList.push(d);
          broadcast("online", { TYPE: "ADD", UNKNOWN: true, DATA: d })
        })
      }
    }
    res.sendStatus(200);
    break;
  case "ONLINE":
    res.send({
      JL: joinList,
      UK: unknowjoinList
    });
    break;
}
});
app.set('/views', path.join(__dirname, 'views'));
app.use('/images', express.static(path.join(__dirname, 'images')));

const server = app.listen(process.env.PORT || 8080, function () {
let port = server.address().port;
console.log("App now running on port", port);
});

io.listen(server).sockets.on('connection', function (socket) {
clientSocket[socket.id] = socket;
// console.log('connection: ' + socket.id);
socket.on('disconnect', function () {
  // console.log('disconnect: ' + socket.id);
  delete clientSocket[socket.id];
});
});


function broadcast(channel, msg) {
// console.log(msg);
for (let id in clientSocket) {
  clientSocket[id].emit(channel, JSON.stringify(msg));
}
}

var joinList = [];
var unknowjoinList = [];

bot.on('beacon', function (event) {
let lineid = event.source.userId;
console.log('beacon: ' + event.beacon.type);
//console.log(event); //Beacon's Json log
var respone;
switch (event.beacon.type) {
  case 'enter':
    people_num++;
    bot.push(lineid, "歡迎回到南港國宅A棟社區 當前人數共有:" + (people_num)+"人");
    let user = fireBaseCollector.userEnter(lineid);
    // console.log("user : " + !!user);
    if (user) {
      if (!find(joinList, "LINEID", lineid)) {
        let d = { LINEID: lineid, NAME: user.NAME, NUMBER: user.NUMBER, TIME: user.JOINTIME };
        joinList.push(d);
        broadcast("online", { TYPE: "ADD", UNKNOWN: false, DATA: d })
      }
    } else {
      if (!find(unknowjoinList, "LINEID", lineid)) {
        event.source.profile().then(function (profile) {
          let d = { LINEID: lineid, NAME: profile.displayName, TIME: new Date().getTime() };
          unknowjoinList.push(d);
          broadcast("online", { TYPE: "ADD", UNKNOWN: true, DATA: d })
        })
      }
    }
    break;

  case 'leave':
    people_num--;
    if (people_num < 0) {
      people_num = 0;
    }
     bot.push(lineid, "您已離開南港國宅A棟，祝您旅途平安！");
    let data = find(unknowjoinList, "LINEID", lineid);
    if (data) {
      unknowjoinList.splice(data[1], 1);
    }
    data = find(joinList, "LINEID", lineid);
    if (data) {
      joinList.splice(data[1], 1);
    }
    fireBaseCollector.userLeave(lineid);
    broadcast("online", { TYPE: "REMOVE", LINEID: lineid })
    break;

  default:
    respone = '我壞掉了';
}
event.reply(respone);
});
//取得天氣資訊
function _getWeather() {
clearTimeout(timer);
//https://data.gov.tw/dataset/45131
getJSON('http://opendata.epa.gov.tw/ws/Data/ATM00698/?$format=json', function (error, response) {
  response.forEach(function (e, i) {
    wt[i] = [];
    wt[i][0] = e.SiteName;
    wt[i][1] = e['Weather'];
    wt[i][2] = e['Temperature'];
    wt[i][3] = e['Visibility'];
    wt[i][4] = e['AtmosphericPressure'];
    wt[i][5] = e['WindPower'];
    wt[i][6] = e['WindDirection'];
    wt[i][7] = e['Rainfall1day'];
    wt[i][8] = e['DataCreationDate'];
  });
});
timer = setInterval(_getWeather, 3600000);
}


function find(arr, s, v) {
for (let i = 0; i < arr.length; i++) {
  if (arr[i][s] === v) {
    return [arr[i], i];
  }
}
return null;
}
