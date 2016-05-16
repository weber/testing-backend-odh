/**
 * Created by webs on 15.05.16.
 */
'use strict';
function Hobby(mongoose, db) {
    const UserHobbySchema = new mongoose.Schema({
        name: {type: String}
    });
    this.model =  db.model('Hobby', UserHobbySchema);
}

/**
 * Добавляет новое увлечение в модель «Увлечения» если не существует
 * @param data
 * @param cb
 * @returns {number} - id созданного увлечения, если существует возвратит -1
 */
Hobby.prototype.add = function (data, cb) {
    if (!data) return -1;
    cb = cb || function (p) {};

    let self = this;

    this.model.find(data, function (err, hobby) {
        if (hobby.length === 0) {
            _addHobby(self, data, cb);
        } else {
            cb(-1);
        }
    });

    function _addHobby(self, data, cb) {
        let newHobby = new self.model(data);
        newHobby.save(function (err) {
            if (err)  console.log(err.message);
            cb(newHobby.id);
        });

    }
}

/**
 * Удаление увлечения
 * @param data
 * @param cb
 * @returns {bool}
 */
Hobby.prototype.remove = function (data, cb) {
    if (!data) return -1;
    cb = cb || function (p) {};

    this.model.remove(data, function (err) {
        cb(true);
    });
}

module.exports = Hobby;
