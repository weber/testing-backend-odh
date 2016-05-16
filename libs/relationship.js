/**
 * Created by webs on 15.05.16.
 */
'use strict';
function Relationship(mongoose, db) {
    const UserRelationshipSchema = new mongoose.Schema({
        relationship: {type: String}
    });
    this.model = db.model('Relationship', UserRelationshipSchema);
}

/**
 * Добавляет новый тип взаимоотношения в модель «Взаимоотношения» если не существует
 * @param data
 * @param cb
 * @returns {number} - id созданного взаимоотношения, если существует возвратит -1
 */
Relationship.prototype.add = function (data, cb) {
    if (!data) return -1;
    cb = cb || function (p) {};

    let self = this;

    this.model.find(data, function (err, relationship) {
        if (relationship.length === 0) {
            _addRelationship(self, data, cb);
        } else {
            cb(-1);
        }
    });

    function _addRelationship(self, data, cb) {
        let newRelationship = new self.Relationship(data);
        newRelationship.save(function (err) {
            if (err)  console.log(err.message);
        });
        cb(newRelationship.id);
    }
}

/**
 * Удаление типа взаимоотношения
 * @param data
 * @param cb
 * @returns {bool}
 */
Relationship.prototype.remove = function (data, cb) {
    if (!data) return -1;
    cb = cb || function (p) {};

    this.model.remove(data, function (err) {
        cb(true);
    });
}
module.exports = Relationship;