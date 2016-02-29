(function api() {
  'use strict';
  function User(rec) {
    this.id = rec.id;
    this.name = rec.name;
    this.role = rec.role;
    this.phone = rec.phone;
  }
  function Student(rec) {
    User.apply(this, arguments);
    this.strikes = rec.strikes;
  }
  Student.prototype = Object.create(User.prototype);
  function Admin(rec) {
    User.apply(this, arguments);
  }
  Admin.prototype = Object.create(User.prototype);
  function Support(rec) {
    User.apply(this, arguments);
    this.location = rec.location;
  }
  Support.prototype = Object.create(User.prototype);
  var doRequest = function doRequest(requestType, url, data, onSuccess) {
    var request = new XMLHttpRequest();
    request.open(requestType, url);
    request.setRequestHeader('Content-Type', 'application/json');
    if (data === null) {
      request.send();
    } else {
      request.send(JSON.stringify(data));
    }
    request.addEventListener('readystatechange', function getResponse(response) {
      if (response.target.readyState === 4) {
        if (response.target.status === 200 || response.target.status === 204) {
          if (onSuccess !== null) {
            onSuccess(response.target.responseText !== '' ? JSON.parse(response.target.responseText) : {});
          }
        }
      } else {
        return response.target.status;
      }
    });
  };
  Student.prototype.getStrikesCount = function getStrike() {
    return this.strikes;
  };
  User.prototype.remove = function remove(callback) {
    var request = new XMLHttpRequest();
    var error;
    request.open('DELETE', window.crudURL + '/' + this.id);
    request.send(JSON.stringify(this.id));
    request.addEventListener('readystatechange', function answer() {
      if (request.readyState === request.DONE) {
        if (request.status === 200 || request.status === 204) {
        } else {
          error = request.status;
        }
        callback(error);
      }
    });
  };
  User.prototype.save = function save(callback) {
    var request = new XMLHttpRequest();
    var request2 = new XMLHttpRequest();
    var answer;
    var error;
    var us;
    var me = this;
    if (this.id) {
      request.open('PUT', window.crudURL + '/' + me.id.toString());
      request.setRequestHeader('Content-Type', 'application/json');
      request.addEventListener('readystatechange', function a() {
        if (request.readyState === request.DONE) {
          if (request.status === 200 || request.status === 204) {
            callback(false);
          } else {
            callback(true);
          }
        }
      });
      request.send(JSON.stringify(me));
    } else {
      request.open('POST', window.crudURL);
      request.setRequestHeader('Content-Type', 'application/json');
      request.addEventListener('readystatechange', function s() {
        if (request.readyState === request.DONE) {
          if (request.status === 200 || request.status === 204) {
            answer = JSON.parse(request.responseText);
            request2.open('PUT', window.crudURL + '/' + answer.id.toString());
            me.id = answer.id;
            request2.setRequestHeader('Content-Type', 'application/json');
            request2.addEventListener('readystatechange', function t() {
              if (request2.readyState === request2.DONE) {
                if (request2.status === 200 || request2.status === 204) {
                  callback(false);
                } else {
                  callback(true);
                }
              }
            });
            request2.send(JSON.stringify(me));
          }
        }
      });
      request.send();
    }
  };
  Admin.prototype.save = function save(callback) {
    var request = new XMLHttpRequest();
    var parser = document.createElement('a');
    var adminURL;
    parser.href = window.crudURL;
    User.prototype.save.call(this, callback);
    adminURL = parser.protocol + '//' + parser.host + '/refreshAdmins';
    request.open('GET', adminURL);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send();
  };
  User.load = function load(callback) {
    var request = new XMLHttpRequest();
    var list;
    var user;
    var i;
    var users = [];
    request.open('GET', window.crudURL);
    request.send();
    request.addEventListener('readystatechange', function answer() {
      if (request.readyState === request.DONE) {
        if (request.status === 200) {
          list = JSON.parse(request.responseText);
          for (i = 0; i < list.length; i++) {
            if (list[i] instanceof Array === false) {
              if (list[i].role === 'Student') {
                user = new Student(list[i]);
              } else if (list[i].role === 'Admin' || list[i].role === 'Administrator') {
                user = new Admin(list[i]);
              } else if (list[i].role === 'Support') {
                user = new Support(list[i]);
              }
              users.push(user);
            }
          }
          callback(list === undefined, users);
        }
      }
    });
  };
  window.User = User;
  window.Student = Student;
  window.Admin = Admin;
  window.Support = Support;
})();
