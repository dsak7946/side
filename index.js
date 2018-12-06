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

                fireBaseCollector.bind(event.source.userId,fireBaseCollector.addUser(this.data[3],this.data[4],this.data[7]).BIND);

                let data = find(users, "userid", event.source.userId);
                users.splice(data[1], 1);
            }
            event.reply(message);
        }
    }
}

var linebot = require('linebot');
var express = require('express');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var path = require('path');
const fireBaseCollector = require('./FireBaseCollector.js');
var firebase = require("firebase");
const clientSocket = {};
const io = require('socket.io');
const bodyParser = require('body-parser');

var bot = linebot({
    channelId: '1611184250',
    channelSecret: 'fc0dde92ef9e9b182bc526a240c18346',
    channelAccessToken: 'fo/507dPjAsjw/gAjXcas2aKo94L9l5QOLrDqTkQ6fcsy5lDv4uRGAGHd0ck8DAumYuGVRYO9pNMJXWrcohw/2KnyeD0XJ1y2fW7fdgfpzmd5ChC5KuAV9REP9kFNlFubCii5jKuSVY81oDn3KTvRwdB04t89/1O/w1cDnyilFU='
});
//底下輸入client_secret.json檔案的內容
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
    "expiry_date": "153919994486"
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
//fireBase資料PULL
var config = {
    apiKey: "AIzaSyD789wa7n6FCRi8eDyrAwmjNDHYw1mAlzo",
    authDomain: "myskrboot.firebaseapp.com",
    databaseURL: "https://myskrboot.firebaseio.com",
    projectId: "myskrboot",
    storageBucket: "myskrboot.appspot.com",
    messagingSenderId: "157912946057"
  };

var db = firebase.database();
//LineBot收到user的文字訊息時的處理函式
bot.on('message', function (event) {
	
    console.log(event);
    let requestMessage = event.message.text;
    let lineid = event.source.userId;
    let data = find(users, "userid", lineid);
    if (data) {
        data[0].check(event);
    } else {
        if (requestMessage.indexOf("綁定") >= 0) {
            let bindId = requestMessage.replace("綁定", "");
            let lineid = event.source.userId;
            let user = fireBaseCollector.bind(lineid, bindId);
            if (user) {
                broadcast("user", {TYPE: "UPDATE_USER"});
                event.reply(["綁定成功!", "歡迎 " + user.NAME + " 使用該系統"]);
                let data = find(unknowjoinList, "LINEID", lineid);
                if (data) {
                    unknowjoinList.splice(data[1], 1);
                    fireBaseCollector.userEnter(lineid, data.TIME);
                    let d = {
                        LINEID: lineid,
                        NAME: user.NAME,
                        NUMBER: user.NUMBER,
                        TIME: data.TIME
                    };
                    joinList.push(d);
                    broadcast("online", {TYPE: "REMOVE", LINEID: lineid})
                    broadcast("online", {TYPE: "ADD", UNKNOWN: false, DATA: d})
                }
            } else {
                event.reply("該綁定碼不存在或已經被綁定");
            }
            return;
        } else if (requestMessage.indexOf("我要報名") >= 0) {
            var userData = new UserData(lineid);
            userData.check(event);
            users.push(userData);
            return;
        }
        fireBaseCollector.getResponeMessage(requestMessage, function (respone) {
            if (respone) {
                bot.push(lineid, respone);
            } else {
                bot.push(lineid, "我看不懂你說的[ " + requestMessage + " ]");
            }
        });
    }
});

  event.source.profile().then(function (profile) {
	  firebase.database().ref('/Users/' + lineid).once('value').then(function(snapshot) {
    		console.log(snapshot.val());
  });

    user = profile.displayName;
    fireBaseCollector.getResponeMessage(requestMessage, function (respone) {
      if (respone) {
        bot.push(lineid, respone);
      } else {
        if (requestMessage == "注意事項") {
          bot.push(lineid, "1.注意掉落物\n2.留意腳邊障礙物\n3.配戴安全帽、安全護目鏡及安全手套\n4.物品不可任意堆置、通道要保持流通");
        }
        else if (requestMessage == "當前人數") {
          bot.push(lineid, "目前有" + (people_num) + "人");
        }
        else if (requestMessage == "我要註冊") {
			if (snapshot.val()=lineid)
          var checkin = Boolean(true);
          if (checkin = true) {
            bot.push(lineid, "您已成功註冊!\nID:" + lineid);
            aaa = 1;
            var gettuser = fireBaseCollector.getUsers();
            if (gettuser) {
              // User is signed in.
              bot.push(lineid, "success");
            } else {
              bot.push(lineid, "faild");
              // No user is signed in.
            }
          }
          else {
            bot.push(lineid, "您已註冊過");
          }
          // var useridd = event.message.text;
          // bot.push(lineid, "您輸入的使用者名稱為：" + (useridd));
          fireBaseCollector.addUser(lineid);
        }
        else if (requestMessage == "天氣資訊") {
          bot.push(
            lineid,
            {
              type: 'template',
              altText: '天氣資訊清單',
              template: {
                // type: 'buttons',
                // // thumbnailImageUrl: buttonsImageURL,
                // title: 'My button sample',
                // text: 'Hello, my button',
                // actions: [
                //   { label: '中央氣象局', type: 'uri', uri: 'https://www.cwb.gov.tw/V7/forecast/' },
                //   { label: '台北', type: 'message', text: '臺北天氣' },
                //   { label: '嘉義', type: 'postback', data: '嘉義天氣' }
                //   // { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                //   // { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                // ],
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
                      // { label: '基隆', type: 'message', text: '基隆天氣' },
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
                      // { label: '屏東', type: 'message', text: '屏東天氣' },
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
        // else if 
        // event.source.profile().then(function(profile){
        //  else if(event.message.type == 'text'){	

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

        // }
        // else
        // {
        //   event.reply({
        //     type: 'sticker',
        //     packageId: '2',
        //     stickerId: getRandomInt(21,47).toString()
        //   });
        //     }
        // });
        else {
          bot.push(lineid, "我看不懂你說的[ " + requestMessage + " ]");
        }

      }
    });
  });


const app = express();
app.post('/', bot.parser());
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/views/index.html');
    console.log(res.sendfile);
});

app.post('/data', [bodyParser.json(), bodyParser.urlencoded({extended: false})], function (req, res) {
    // console.log(req.body);
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
                sendData.push({NAME: e.NAME, NUMBER: e.NUMBER, PASSWORD: e.PASSWORD, LINEID: e.LINEID, BIND: e.BIND});
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
                    broadcast("online", {TYPE: "REMOVE", LINEID: reqJson.USER.LINEID});
                    bot.getUserProfile(reqJson.USER.LINEID).then(function (profile) {
                        let d = {LINEID: reqJson.USER.LINEID, NAME: profile.displayName};
                        unknowjoinList.push(d);
                        broadcast("online", {TYPE: "ADD", UNKNOWN: true, DATA: d})
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
    // console.log(event.beacon.type + " - " + lineid);
    switch (event.beacon.type) {
        case 'enter':
            let user = fireBaseCollector.userEnter(lineid);
            // console.log("user : " + !!user);
            if (user) {
                if (!find(joinList, "LINEID", lineid)) {
                    let d = {LINEID: lineid, NAME: user.NAME, NUMBER: user.NUMBER, TIME: user.JOINTIME};
                    joinList.push(d);
                    broadcast("online", {TYPE: "ADD", UNKNOWN: false, DATA: d})
                }
            } else {
                if (!find(unknowjoinList, "LINEID", lineid)) {
                    event.source.profile().then(function (profile) {
                        let d = {LINEID: lineid, NAME: profile.displayName, TIME: new Date().getTime()};
                        unknowjoinList.push(d);
                        broadcast("online", {TYPE: "ADD", UNKNOWN: true, DATA: d})
                    })
                }
            }
            break;
        case 'leave':
            let data = find(unknowjoinList, "LINEID", lineid);
            if (data) {
                unknowjoinList.splice(data[1], 1);
            }
            data = find(joinList, "LINEID", lineid);
            if (data) {
                joinList.splice(data[1], 1);
            }
            fireBaseCollector.userLeave(lineid);
            broadcast("online", {TYPE: "REMOVE", LINEID: lineid})
            break;
    }
});


function find(arr, s, v) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][s] === v) {
            return [arr[i], i];
        }
    }
    return null;
}

//這是發送訊息給user的函式
function sendMessage(eve, msg) {
    eve.reply(msg).then(function (data) {
        // success
        return true;
    }).catch(function (error) {
        // error
        return false;
    });
}


const linebotParser = bot.parser();
app.post('/', linebotParser);
