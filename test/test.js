'use strict';
const utils = require('../utils.js'),
  http = require('http'),
  logger = require('../logger.js');

let pa = function(a) {
  return new Promise(function(resolve, reject) {
    logger.debug('invoked a', a);
    if(a){
      resolve(a + 1);
    } else {
      reject(new Error('a error!'));
    }
  });
},
  pb = function(b) {
    return new Promise(function(resolve, reject) {
      logger.debug('invoked b', b);
      if(b){
        resolve(b + 1);
      } else {
        reject(new Error('b error!'));
      }
    });
  };
let promises = [
  pa,
  pb,
];

let execSeq = function(){
  let trigger = Promise.resolve();
  promises.forEach((task)=>{
    trigger = trigger.then(task)
  })
  return trigger;
}

execSeq()
  .then(logger.debug)
  .catch(logger.error);