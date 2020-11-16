'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  ejs: {
    enable: true,
    package: 'egg-view-ejs',
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose'
  },
  // 安装模块并且配置 cnpm install egg-cors --save 
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  jwt: {
    enable: true,
    package: "egg-jwt"
  }
};
