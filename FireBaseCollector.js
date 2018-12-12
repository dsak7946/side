const firebase = require("firebase");

const PROJECT_ID = "myskrboot";
const API_KEY = "AIzaSyD789wa7n6FCRi8eDyrAwmjNDHYw1mAlzo";

firebase.initializeApp({
    apiKey: API_KEY,
    authDomain: PROJECT_ID + ".firebaseapp.com",
    databaseURL: "https://" + PROJECT_ID + ".firebaseio.com",
    storageBucket: PROJECT_ID + ".appspot.com",
});
const db = firebase.database();

var users = [];
let ref = db.ref("/Users/");
ref.once("value", function (snapshot) {
    if (snapshot.toJSON()) {
        users = snapshot.val();
    }
});
ref = db.ref("/Messages/");
ref.on('value', function (d) {
    if (!d.val()) {
        var ref = db.ref("/Messages/");
        var value = {
            "你好": "很好"
        }
        ref.set(value);
    }
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function fund(s, v) {
    for (let i = 0; i < users.length; i++) {
        if (users[i][s] === v) {
            return [users[i], i];
        }
    }
    return null;
}

class Collector {

    getUsers() {
        return users;
    }

    getUserByLineId(lineid) {
        return fund("LINEID", lineid);
    }

    removeUser(lineid) {
        let data = fund("LINEID", lineid);
        if (data) {
            users.splice(data[1], 1);
            db.ref("/Users/").set(users);
            return true;
        } else {
            return false;
        }
    }
    addUser(lineid, userid) {
        let user = {
            LINEID: lineid,
            NAME: userid,
            STATUS: "LEAVE"
        };

        users.push(user);
        db.ref("/Users/").set(users);
        console.log(user.LINEID);
    }

    bind(lineid, bindid) {
        let data = fund("BIND", bindid);
        if (!data) {
            return null;
        }
        let user = data[0];
        if (user.LINEID) {
            return null;
        } else {
            user.LINEID = lineid;
            db.ref("/Users/" + data[1]).update({ LINEID: lineid });
            return user;
        }
    }

    userLeave(lineid) {
        let data = fund("LINEID", lineid);
        if (!data) {
            return false;
        }
        let user = data[0];
        if (user) {
            user.STATUS = "LEAVE";
            db.ref("/Users/" + data[1]).update({ STATUS: "LEAVE" });
            return true;
        }
        return false;
    }

    userEnter(lineid, time) {
        let data = fund("LINEID", lineid);
        if (!data) {
            return null;
        }
        let user = data[0];
        if (!time) {
            time = new Date().getTime();
        }
        if (user) {
            user.JOINTIME = time
            user.STATUS = "ENTER";
            db.ref("/Users/" + data[1]).update({ STATUS: "JOIN", JOINTIME: user.JOINTIME });
            return user;
        }
        return null;
    }

    getResponeMessage(request, callback) {
        let ref = db.ref("/Messages/" + request);
        ref.once("value", function (snapshot) {
            callback(snapshot.val());
        });
    }
}

var collect = new Collector();
module.exports = collect;
