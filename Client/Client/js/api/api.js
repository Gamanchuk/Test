(function() {
  function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
  }
  function doRequest(method,url, data, callback){
    var request = new XMLHttpRequest();
    request.open(method, url);
    request.setRequestHeader('Content-Type', 'application/json');
    if(data != null){
      request.send(data);
    } else {
      request.send();
    }
    request.addEventListener('readystatechange', function(sender) {
      if(sender.target.readyState === sender.target.DONE){
        callback(sender.target);
      }
    });
  }
  function User(data) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.role = data.role;
  }
  User.prototype.save = function save(callback) {
    var request = new XMLHttpRequest();
    var request2 = new XMLHttpRequest();
    var answer;
    var caller = this;
    if(this.id){
      request.open('PUT', window.crudURL + '/' + this.id.toString());
      request.setRequestHeader('Content-Type', 'application/json');
      request.addEventListener('readystatechange', function (sender) {
        if (sender.target.readyState === sender.target.DONE) {
          if (Math.round(sender.target.status / 100) === 2) {
            callback(false);
          } else {
            callback(true);
          }
        }
      });
      request.send(JSON.stringify(caller));
    } else {
      request.open('POST', window.crudURL);
      request.setRequestHeader('Content-Type', 'application/json');
      request.addEventListener('readystatechange', function(sender) {
        if (sender.target.readyState === sender.target.DONE) {
          if (sender.target.status === 200) {
            answer = JSON.parse(sender.target.responseText);
            request2.open('PUT', window.crudURL + '/' + answer.id.toString());
            caller.id = answer.id;
            request2.setRequestHeader('Content-Type', 'application/json');
            request2.addEventListener('readystatechange', function (sender2) {
              if (sender2.target.readyState === sender2.target.DONE) {
                if(Math.round(sender2.target.status / 100) === 2) {
                  callback(false);
                } else {
                  callback(true);
                }
              }
            });
            request2.send(JSON.stringify(caller));
          }
        }
      });
      request.send();
    }
    console.log(this);

  };
  User.prototype.remove = function remove(callback){
    var request = new XMLHttpRequest();
    var caller = this;
    request.open('DELETE', window.crudURL + '/' + caller.id.toString());
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('readystatechange', function (sender) {
      if (sender.target.readyState === sender.target.DONE) {
        if (Math.round(sender.target.status / 100) === 2) {
          callback(false);
        } else {
          callback(true);
        }
      }
    });
    request.send(JSON.stringify(caller));
  };
  User.load = function load(callback) {
    var request = new XMLHttpRequest();
    var answer;
    var list = [];
    request.open('GET', window.crudURL);
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('readystatechange', function (sender) {
      if (sender.target.readyState === sender.target.DONE) {
        if (sender.target.status === 200) {
          answer = JSON.parse(sender.target.responseText);
          answer.forEach(function (record){
            if (record.role === 'Student') {
              list.push(new Student(record));
            }
            if(record.role === 'Support') {
              list.push(new Support(record));
            }
            if (record.role === 'Administrator') {
              list.push(new Admin(record));
            }
          });
          callback(false, list);
        } else {
          callback(true, {});
        }
      }
    });
    request.send();
  };
  function Admin(data){
    Admin.superclass.constructor.apply(this, arguments);
  }
  extend(Admin,User);
  Admin.prototype.save = function s(callback){
    User.prototype.save.call(this, callback);
    var request3 = new XMLHttpRequest();
    var parser = document.createElement('a');
    parser.href = window.crudURL;
    request3.open('GET', parser.protocol + '//' + parser.host + '/refreshAdmins');
    request3.send();
  };
  function Student (data){
    Student.superclass.constructor.apply(this, arguments);
    this.strikes = data.strikes;
    this.getStrikesCount = function getStrikesOut() {
      return this.strikes;
    };
  }
  extend(Student, User);
  function Support(data) {
    Support.superclass.constructor.apply(this, arguments);
    this.location = data.location;
  }
  extend(Support, User);
  window.User = User;
  window.Student = Student;
  window.Admin = Admin;
  window.Support = Support;
})();
