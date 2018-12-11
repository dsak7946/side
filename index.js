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
  let requestMessage = event.message.text;
  let lineid = event.source.userId;
  var checkin = new Boolean(false);
  var replyMsg = '';
  var aaa = 0;
  var vv = '';
  console.log(event);

  event.source.profile().then(function (profile) {   //Loading Firebase message json for reply.
    user = profile.displayName;
    if (requestMessage == "注意事項") {
      bot.push(lineid, "1.注意掉落物\n2.留意腳邊障礙物\n3.配戴安全帽、安全護目鏡及安全手套\n4.物品不可任意堆置、通道要保持流通");
      console.log(user);
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
    else {
      bot.push(lineid, "我看不懂你說的[ " + requestMessage + " ]");
    }

    
  });//Loading Firebase message json for reply.
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

//Repeat Message
// setTimeout(function () {
//   var userId = 'U856be5532e1fb992214c33c2b428a8fc';
//   var sendMsg = "Welcome to Popo's LINE-BOT";
//   bot.push(userId, sendMsg);
//   console.log('send: ' + sendMsg);
// }, 5000);

//beacon event
bot.on('beacon', function (event) {
  let lineid = event.source.userId;
  console.log('beacon: ' + event.beacon.type);
  //console.log(event); //Beacon's Json log
  var respone;
  switch (event.beacon.type) {
    case 'enter':
      people_num++;
      respone = '你進入教室 當前人數:' + (people_num);
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
      respone = '你離開教室 當前人數:' + (people_num);
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

