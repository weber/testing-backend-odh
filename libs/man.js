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
    } else if (typeof hobby_data === 'object') {
        //
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

/**
 * Удаление увлечение пользователю
 * @param data -
 * @param cb
 * @returns {bool}
 */
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

/**
 * Сортировака/филтр/пагинация
 * @param criteria
 * @param cb
 */
Man.prototype.list = function (criteria, cb) {
    cb = cb || function (p) {};
    criteria = criteria || {};
    let self = this;
    let result = self.model;

    if (typeof criteria === 'object') {
        if (typeof criteria.filter === 'object' && Object.keys(criteria.filter).length > 0) {
            result =  result.find(criteria.filter);
        } else {
            result =  result.find({});
        }

        if (typeof criteria.orderby === 'object' && Object.keys(criteria.orderby).length > 0){
            result =   result.sort(criteria.orderby);
        }

        if (criteria.step) {
            result =  result.skip(criteria.step)
        }

        if (criteria.limit) {
            result =  result.limit(criteria.limit)
        }
    }

    result.exec(function (err, users) {
        users.forEach(function (item, k) {
              console.log(item.firstname);
              console.log(item.lasttname);
              console.log(item.hobby);
        })
    });
}

Man.prototype.getIdByName = function (name, cb) {
    cb = cb || function (p) {};
    name = name || {};
    let self = this;

    if (typeof name !== 'object' || Object.keys(name).length === 0)  return -1;

    self.model.find().where(name).exec(function (err, users) {
        let users_id = [];
        users.forEach(function (item, k) {
            users_id.push(item._id)
        });
        cb(users_id);
    });
}

Man.prototype.addRelationship = function (idUser, relationshipUser,  cb) {
    cb = cb || function (p) {};
    idUser = idUser || {};
    relationshipUser = relationshipUser || {};
    let self = this;
    if (idUser) {

        self.model.where({_id: idUser}).update({relationship: relationshipUser}, function (err, t) {
            self.emit('added-relation-user', {added: t.ok});
        });
    }
}

/**
 * Добавление взаимоотношений между 2 пользователями
 * @param idUser
 * @param idUser2
 * @param relation
 * @param cb
 * @constructor
 */
Man.prototype.AddRelationBetweenUsersById = function (idUser, idUser2, relation, cb) {
    cb = cb || function (p) {};
    idUser = idUser || null;
    idUser2 = idUser2 || null;
    let self = this;

    _addRelationUser(idUser, idUser2, relation, function () {
        _addRelationUser(idUser2, idUser, relation, function () {
            self.emit('added-relation-users', {added: true});
            cb();
        });
    });

    function _addRelationUser(id_user, id_user2, new_relation, cbx) {
        self.model.findById({_id: id_user}, function (err, user) {

            if (!user) return -1;

            self.relationship.model.find(function (err, rel) {
                let _relationship = [];
                rel.forEach(function (item, k) {
                    _relationship.push(item.relationship);
                });

                for (let name in user.relationship[0]) {
                    if (_.indexOf(_relationship, name)) {
                       // console.log(name);
                    } else {
                        self.relationship.add({relationship: name});
                    }
                }
            });

            let _new_relation = {};
            for (let k in new_relation) {
                if (new_relation[k] === true) {
                    _new_relation[k] = [];
                    _new_relation[k].push(id_user2);
                }

                if (user.relationship.length > 0 && _.indexOf(user.relationship[0][k], id_user2) !== -1) {
                     _.remove(user.relationship[0][k], function (n) {
                        return (n !== id_user2) == 0;
                    })
                }
            }

            let  mergeRelationship = _new_relation;
            if (Object.keys(mergeRelationship).length !== 0)
                if (user.relationship.length > 0 && Object.keys(user.relationship[0]).length !== 0) {
                    let _f = {}; {
                    for (let k in _new_relation) {
                        if (_new_relation[k].length > 0 || user.relationship[0][k].length > 0) {
                            let _fa = _.uniq(_.concat(user.relationship[0][k],  _new_relation[k]));

                            _f[k] = _.remove(_fa, function (n) {
                                return (n === true || n === false || n === null) == 0;
                            });
                        }
                    }

                    mergeRelationship = _f;
                }

                self.model.update({_id: id_user}, {relationship: mergeRelationship}, function (err, t) {
                    if (err) throw err;
                    cbx(t.ok);
                });
            } else {

                self.model.update({_id: id_user}, {relationship: user.relationship[0]}, function (err, t) {
                    if (err) throw err;
                    cbx(t.ok);
                });
            }
        })
    }
}

/**
 * поиск пользователя пользователей с определенным типом взаимоотношений
 * @param idUser
 * @param relation
 * @param cb
 * @returns {number}
 * @constructor
 */
Man.prototype.FindUsersByRelation = function (idUser, relation, cb) {
    cb = cb || function (p) {};
    idUser = idUser || '';
    relation = relation || {};
    let self = this;

    if (!idUser && typeof idUser === 'object') return -1;
    if (Object.keys(relation).length === 0) return -1;

    let query = {};
   // query['relationship'] = {$exists: true, $ne: []};
    query['_id'] = {$ne: `${idUser}`};
    for (let k in relation) {
        if (relation[k] === true) {
            query[`relationship.${k}`] = `${idUser}`;
        } else if (relation[k] === false) {
            query[`relationship.${k}`] = {$ne: `${idUser}`};
        }
    }

    self.model.where(query).exec(function (err, items) {
        if (err) throw  err;
        self.emit('find-users-relation', {find: true, data: items});
        cb(items)

    })
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
