#! /usr/bin/env node
/*
  1、通过npm init --y 初始化一个node项目
  2、创建一个JS文件，并且在一个JS文件的头部通过
  #! /usr/bin/env node 告诉系统这个文件将来在NodeJS环境下执行
  3、在package.json中新增bin的key，然后在这个key的取值中告诉系统需要新增什么指令这个指令执行哪个文件
  "bin" : {
    "nue-cli": "./bin/index.js"
  }
  4、通过npm link将本地的包链接到全局 
*/
console.log('maxb 666!')