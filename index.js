/**
 * Created by webs on 15.05.16.
 */
'use strict';
let mongoose = require('mongoose');
let Man = require('./libs/man');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    const man = new Man(mongoose, db);
    const hobby = man.hobby;
    const relationship = man.relationship;

    // init
    /*let hobbys = [
        {name: 'спорт'},
        {name: 'шахматы'},
        {name: 'рыбалка'},
        {name: 'танцы'},
        {name: 'охота'},
    ];

    hobbys.forEach(function (item) {
        hobby.add(item);
    });

    let relationships = [
        {relationship: 'друзья'},
        {relationship: 'враги'},
        {relationship: 'знакомые'},
        {relationship: 'чужие'},
        {relationship: 'влюблённые'}
        {relationship: 'родственики'}
    ];

    relationships.forEach(function (item) {
        relationship.add(item);
    });*/


    // Добавление пользователей
  /*  man.add({firstname: 'Андрей', lasttname: 'Ковалев', age: 30}, function (id) {
        console.log(id);
    });
    man.add({firstname: 'Васек', lasttname: 'Петров', age: 20}, function (id) {
        console.log(id);
    });
    man.add({firstname: 'Димон', lasttname: 'Сидоров', age: 25}, function (id) {
        console.log(id);
    });
    man.add({firstname: 'Игорь', lasttname: 'Петров', age: 19}, function (id) {
        console.log(id);
    });*/

    // Добавления/удаления хобби пользователя
    /*
    man.addHobby('573ada0ebe4050935f10f05f', [{name: 'Flay'}, {name: 'охота'}]);
    // man.removeHobby('573ada0ebe4050935f10f05f', {name: 'Flay2'});
    man.addHobby('573ada0ebe4050935f10f060', [{name: 'спорт'}, {name: 'рыбалка'}]);
    // man.removeHobby('573ada0ebe4050935f10f060', {name: 'Flay2'});
    man.addHobby('573ada0ebe4050935f10f061', [{name: 'танцы'}, {name: 'шахматы'}]);
    // man.removeHobby('573ada0ebe4050935f10f061', {name: 'Flay2'});
    man.addHobby('573ada0ebe4050935f10f062', [{name: 'охота'}, {name: 'рыбалка'}, {name: 'шахматы'}]);
    // man.removeHobby('573ada0ebe4050935f10f062', {name: 'Flay2'});
    */

   // Сортировака/филтр/пагинация
    /*
    man.list({orderby: {lasttname: 'desc'}, limit: 20});
    man.list({
        orderby: {lasttname: 'asc', firstname: 'desc'},
        limit: 5,
        step: 0,
        filter: {
            hobby: {name: 'спорт14'}
        }
    });
    */
    /*man.getIdByName({firstname: 'Васек', lasttname: 'Петров'}, function (UserIds) {
        man.addRelationship(UserIds[0], {
            'друзья': ['573ada0ebe4050935f10f05f'],
            'враги': ['573ada0ebe4050935f10f060'],
            'знакомые': [],
            'чужие': ['573ada0ebe4050935f10f061'],
            'влюблённые': [],
            'родственики': ['573ada0ebe4050935f10f062', '573ada0ebe4050935f10f05f']
        });
    });*/

    // Добавляет взаимоотношения между 2 пользователями
   /*
   man.AddRelationBetweenUsersById('573b7cb3b965fcae09298d35', '573b7cb3b965fcae09298d37', {'друзья': false, 'родственики': false, 'враги': true}, function (err) {
       man.model.findById({_id: '573b7cb3b965fcae09298d37'}, function (err, item) {
           console.log(item.relationship)
       })
   });
   man.AddRelationBetweenUsersById('573b7cb3b965fcae09298d35', '573b7cb3b965fcae09298d38', {'друзья': true, 'родственики': false, 'враги': true}, function (err) {
       man.model.findById({_id: '573b7cb3b965fcae09298d35'}, function (err, item) {
           console.log(item.relationship)
       })
   });
   */


    man.model.where({'relationship.враги':'573b7cb3b965fcae09298d35'}).exec(function (err, items) {
        items.forEach(function (data, k) {
            console.log(data._id);
            console.log(data.lasttname);
            console.log(data.firstname);
            console.log(data.relationship);
            console.log('------------------------');
        })

    })





    /*man.model.find(function (err, m) {
        m.forEach(function (item, k) {
            console.log(item._id)
            console.log(item.firstname)
            console.log(item.lasttname)
            console.log(item.relationship)
            console.log('---------------------------------')
        })

    })*/
   /*
    relationship.model.find(function (err, rel) {
        console.log(rel)
    })

    hobby.model.find(function (err, hobbys) {
         console.log(hobbys)
     })

    man.on('new-hobby', function (id) {
        hobby.model.find(function (err, hobbys) {
            console.log(hobbys)
        })
    });
    man.on('added-hobby-user', function (id) {
        man.model.find(function (err, users) {
            console.log(users)
        });
    });
    man.on('removed-hobby-user', function (id) {
        man.model.find(function (err, users) {
            console.log(users)
        });
    });*/

});
const pathdb = 'mongodb://localhost/odhDB';
mongoose.connect(pathdb);
