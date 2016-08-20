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

// let starter = Promise.resolve(1);
// promises.forEach(function(promise){
//   starter = starter.then(promise);
// });


let execSeq = function(){
  
  // function recordValue(results, value) {
  //     results.push(value);
  //     return results;
  // }
  // let pushValue = recordValue.bind(null, []);

  let trigger = Promise.resolve();
  promises.forEach((task)=>{
    trigger = trigger.then(task)
    // .then(pushValue);
  })
  return trigger;
  // return promises.reduce(function (promise, task) {
  //     return promise.then(task).then(pushValue);
  // }, Promise.resolve());
}

execSeq()
// Promise.resolve()
//   .then(pa)
//   .then(pb)
  .then(logger.debug)
  .catch(logger.error);


// starter
// .then((res)=>{
//   logger.debug('finished!', res)
// }).catch((err)=>{
//   logger.warn(' something went wrong!')
//   console.trace(err);
// });