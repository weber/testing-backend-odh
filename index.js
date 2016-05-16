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
    ];

    relationships.forEach(function (item) {
        relationship.add(item);
    });*/

    man.add({firstname: 'Alex', lasttname: 'Ro', age: 18}, function (id) {
        console.log(id);
    });

   // hobby.remove({name: 'спорт'});

    /*relationship.model.find(function (err, rel) {
        console.log(rel)
    })*/
   /* hobby.model.find(function (err, hobbys) {
        console.log('---------------------------');
        console.log(hobbys)
    })*/

    man.addHobby('5738cf45a518e87c5760bb91', [{name: 'Flay'}, {name: 'спорт14'}], function (r) {
        console.log(r);
    });

    man.removeHobby('5738cf45a518e87c5760bb91', {name: 'Flay2'});


    man.on('new-hobby', function (id) {
        hobby.model.find(function (err, hobbys) {
            console.log('---------------------------');
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
    });

});
const pathdb = 'mongodb://localhost/odhDB';
mongoose.connect(pathdb);
