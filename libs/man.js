/**
 * Created by webs on 15.05.16.
 */
'use strict';
const Hobby = require('./hobby');
const Relationship = require('./relationship');
const EventEmitter = require('events');
const util = require('util');
const _ = require('lodash');


function Man(mongoose, db) {
    EventEmitter.call(this);
    const UserSchema = new mongoose.Schema({
        firstname: {type: String},
        lasttname: {type: String},
        age: {type: Number, min: 18, index: true},
        date: {type: Date, default: Date.now()},
        hobby: [],
        relationship: [mongoose.Schema.Types.Mixed]
    });
    this.model = db.model('User', UserSchema);
    this.relationship = new Relationship(mongoose, db);
    this.hobby = new Hobby(mongoose, db);

}
util.inherits(Man, EventEmitter);
/**
 * Создаёт нового пользователя если не существует
 * @param data
 * @param cb
 * @returns {number} - id созданного пользователя, если существует возвратит -1
 */
Man.prototype.add = function (data, cb) {
    if (!data) return -1;
    cb = cb || function (p) {};
    let self = this;

    this.model.find(data, function (err, user) {
        if (user.length === 0) {
            _addUser(self, data, cb);
        } else {
            cb(-1);
        }
    });

    function _addUser(self, data, cb) {
        let newUser = new self.model(data);
        newUser.save(function (err) {
            if (err)  console.log(err.message);
        });
        cb(newUser.id);
    }
}
/**
 * Удаление пользователя
 * @param data
 * @param cb
 * @returns {bool}
 */
Man.prototype.remove = function (data, cb) {
    if (!data) return -1;
    cb = cb || function (p) {};

    this.model.remove(data, function (err) {
        cb(true);
    });
}

/**
 * Добавления увлечение пользователю
 * @param data -
 * @param cb
 * @returns {bool}
 */
Man.prototype.addHobby = function (user_id, hobby_data, cb) {
    if (!hobby_data || !user_id) return -1;
    cb = cb || function (p) {};
    let self = this;

    if (hobby_data.length > 0) {
        // добавление новых увлечений через массив
        hobby_data.forEach(function (item, k) {
            self.hobby.model.find().where(item).exec(function (err, users) {
                if (users.length === 0) {
                    self.hobby.add(item, function (id) {
                        self.emit('new-hobby', {hobby_id: id});
                    });
                }
            });
        });
    } else {
        // добавление новых увлечений через массив
        this.hobby.model.find().where(hobby_data).exec(function (err, users) {
            if (users.length === 0) {
                self.hobby.add(hobby_data, function (id) {
                    self.emit('addedHobby', {hobby_id: id});
                });
            }
        })
    }

    self.model.where({_id: user_id}).exec(function (err, r) {
        if (r.length === 0) return -1;
        let _hobby = hobby_data;

        if (r[0].hobby !== null)
            _hobby = mergeAddPropName(r[0].hobby, hobby_data)

         self.emit('get-hobby-user-add', {added: r.ok, hobby:_hobby});
    })

    self.on('get-hobby-user-add', function (result) {
        self.model.where({_id: user_id}).update({hobby: result.hobby}, function (err, t) {
            self.emit('added-hobby-user', {added: t.ok});
        });
    });
}

Man.prototype.removeHobby = function (user_id, hobby_data, cb) {
    if (!hobby_data || !user_id) return -1;
    cb = cb || function (p) {};
    let self = this;

    self.model.where({_id: user_id}).exec(function (err, r) {
        if (r.length === 0) return -1;
        let _hobby = hobby_data;

        if (r[0].hobby !== null)
            _hobby = mergeRemovePropName(r[0].hobby, hobby_data)

        self.emit('get-hobby-user-remove', {added: r.ok, hobby:_hobby});
    })

    self.on('get-hobby-user-remove', function (result) {
        self.model.where({_id: user_id}).update({hobby: result.hobby}, function (err, t) {
            self.emit('removed-hobby-user', {added: t.ok});
        });
    });
}

function mergeAddPropName(obj1, obj2) {
    let obj3 = [];
    let obj = [];

    if (obj2.length > 0) {
        obj2.forEach(function (item, k) {
            obj1.push(item)
        });
    } else {
        obj1.push(obj2)
    }

    obj1.forEach(function (item, k) {
        obj3[item.name] = item
    });

    for (var attrname in obj3) {
        obj.push({name: obj3[attrname].name})
    }

    return obj;
}
function mergeRemovePropName(obj1, obj2) {
    let obj3 = [];
    let obj = [];

    if (obj2.length > 0) {
        obj1.forEach(function (item, k) {
            if (_.filter(obj2, item).length > 0)
                obj1.splice(k, 1)
        })
    } else {
        obj1.forEach(function (item, k) {
            if (_.filter([obj2], item).length > 0)
                obj1.splice(k, 1)
        })
    }

    obj1.forEach(function (item, k) {
        obj3[item.name] = item
    });

    for (var attrname in obj3) {
        obj.push({name: obj3[attrname].name})
    }

    return obj;
}

module.exports = Man;
