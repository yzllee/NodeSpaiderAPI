/**
 * 抓取数据
 */
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);

app.use(express.static(__dirname + '/public'));

const fs = require('fs');
const xlsx = require('node-xlsx');
const superagent = require('superagent')
require('superagent-charset')(superagent);
const cheerio = require('cheerio');
const async = require('async');

//解决跨域
// app.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
//   res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
//   res.header('X-Powered-By', '3.2.1')
//   if (req.method == 'OPTIONS') res.send(200)
//   else  next()
// })

const DBPageList = [], //需要爬取得豆瓣地址
    NTPageList = [], //19楼
    pageNum = 10 //要爬取得页数
let DBData = [], //豆瓣数据
    NTData = []; //19楼数据
for (let i = 0; i < (pageNum * 25); i += 25) {
    DBPageList.push(`https://www.douban.com/group/145219/discussion?start=${i}`)
}
for (let i = 0; i < (pageNum * 25); i += 25) {
    DBPageList.push(`https://www.douban.com/group/HZhome/discussion?start=${i}`)
}
for (let i = 0; i < (pageNum * 25); i += 25) {
    DBPageList.push(`https://www.douban.com/group/467221/discussion?start=${i}`)
}
for (let i = 0; i < (pageNum * 30); i++) {
    NTPageList.push(`http://www.19lou.com/forum-1637-${i}.html`)
}

function task() {
    async.eachLimit(DBPageList, 15, (perPageUrl, callback) => {
        superagent
            .get(perPageUrl)
            .end((err, res) => {
                const $ = cheerio.load(res.text);

                if (err) {
                    callback(err);
                    return;
                }

                $('table.olt td.title a').each((index, el) => {
                    DBData.push({
                        title: $(el).attr('title'),
                        url: $(el).attr('href'),
                        time: $(el).parent().siblings('td.time').text()
                    })

                });

                callback();
            })
    }, (err) => {
        if (err) throw err;
        else console.log('获取成功！');

        app.get('/douban/data', function (req, res) {
            res.send(JSON.stringify(DBData));
        })
    });

    // async.eachLimit(NTPageList, 40, (perPageUrl, callback) => {
    //     superagent
    //         .get(perPageUrl)
    //         .charset('gbk')
    //         .end((err, res) => {
    //             const $ = cheerio.load(res.text);

    //             if (err) {
    //                 callback(err);
    //                 return;
    //             }

    //             $('table.list-data th.title a.J_imgThread').each((index, el) => {
    //                 NTData.push({
    //                     title: $(el).attr('title'),
    //                     url: 'https:' + $(el).attr('href'),
    //                     time: $(el).parents('th.title').siblings('td.lastpost').find('span.numeral').text()
    //                 })

    //             });

    //             callback();
    //         })
    // }, (err) => {

    //     app.get('/nineteen/data', function (req, res) {
    //         res.send(JSON.stringify(NTData));
    //     })
    // })
}
setInterval(function () {
    data = [];
    task();
}, 60 * 60 * 1000);
task();
http.listen(8081, function () {
    console.log('listening port at 8081');
})