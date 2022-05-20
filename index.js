#!/usr/bin/env node
const path = require('path')
const { cwd } = require('node:process');
let config={};
try {
  //  config=require(path.join(__dirname,'rfc.config.js'));
  config=require(path.join(cwd(),'rfc.config.js'));
} catch (error) {
  console.log('请创建rfc.config.js文件')
}

const fs = require('fs')
// const qs = require('qs')

let baseUrl = config.baseUrl || String.raw`./src/router`,
    baseWriteUrl=config.baseWriteUrl || String.raw`./src`,
    routerArr
const readFile = path.resolve(urlParse(baseUrl), 'index.js')
const writeFile = path.resolve(urlParse(baseUrl), 'index.mjs')
 baseWriteUrl=path.resolve(urlParse(baseWriteUrl))
const type = process.argv.slice(2)[0];
console.log('当前类型：',type);
const templateStr = `
<template>
<div class=""></div>
</template>
<script>
export default {
name: "",
components: {},
mixins: [],
props: {},
data () {
    return {}
},
computed: {},
watch: {},
filter: {},
created () { },
mounted () { },
methods: {},
}
</script>
<style lang='scss' scoped>
</style>
`

//创建文件
function vue() {
  for (const iterator of routerArr.default) {
    mkdirAll(String(iterator.component))
  }
}
//转义 \
function urlParse(url){
  return url.split(path.sep).join('\\\\');
}
//序列化data
function qs(obj) {
  return Object.keys(obj).map(function(key) {
    return key + '=' + obj[key];
  }).join('&');
}
//生成参数
function txt() {
  let templateStr = '', newUrl;
  for (const iterator of routerArr.default) {
    const { txtUrl, url } = parseUrl(String(iterator.component))
    //这个地址需要处理
    const { queryData, queryArr } = readFileReg(url, /query.(\w*)/gi)
    // console.log(routerArr, '返回')
    templateStr += `
    // ${iterator.meta.title} 
    路由: ${iterator.path}
    参数: ${queryArr.join(',')|| "无" }
    ${ queryArr.join(',') && (qs(queryData)?'示例: '+ iterator.path+'?'+qs(queryData):'示例: '+ iterator.path)}
    `
    newUrl=txtUrl;
  }
  fs.writeFile(path.join(newUrl,'1.txt'), templateStr, (err) => {
    if (err) {
      console.log('创建导出文件失败')
      return
    }
    console.log(`创建导出文件`)
  })
}

//主函数
async function main() {
  try {
   await fs.copyFile(readFile, writeFile, (e) => {
      console.log('创建临时文件...')
    })
  } catch (err) {
    console.log(err)
  }
  routerArr = await import('/' + writeFile)

  fs.unlinkSync(writeFile, function (err) {
    if (err) return
  })
  if(type === 'vue'){
    vue()
  }
  if(type === 'txt'){
    txt()
  }
}

main();

//解析js文件所需内容
function readFileReg(url, reg) {
  let queryData = {},
    queryArr = []
  let arr = fs
    .readFileSync(url, 'utf8', function (error, data) {
      if (error) {
        console.log(error)
        return false
      }
    })
    .match(reg)
  console.log('解析返回数据', arr)
  if (arr) {
    for (const iterator of arr) {
      let key = iterator.split('.')[1]
      if(key){
        queryData[key] = 'xxx'
        queryArr.push(key)
      }
  
    }
  }

  return { queryData, queryArr }
}
//创建目录
function  mkdirOne(url) {
  if(!fs.existsSync(url)){
    fs.mkdirSync(`${url}`, function (err) {
      if (err) {
        console.log(`目录${url}已存在，无需创建`)
        return
      }
      console.log(`创建目录${url}成功`)
    })
  }
}
//解析基本路由路径
function parseUrl(url) {
  let urlList = url.split('/')
  first = urlList.shift()
  last = urlList.pop()
  lastName = last.split('.')[0]
  newUrl = urlList.reduce((str, item) => {
    return str + '/' + item
  })
  return { urlList, lastName,txtUrl:path.join(baseWriteUrl,newUrl), url:path.join(baseWriteUrl,newUrl,`${lastName}.vue`) }
}
//创建目录和文件
function mkdirAll(data) {
  const { urlList, lastName, url,txtUrl } = parseUrl(data)
  // console.log(urlList, lastName, url ,'返回参数')
  let newUrlList = urlList.reduce((str, item) => {
    mkdirOne(path.join(baseWriteUrl,str))
    return str + '/' + item
  })
  mkdirOne(path.join(baseWriteUrl,newUrlList))
  try {
    fs.accessSync(url)
    console.log(`${lastName}已存在，无需创建`)
  } catch (e) {
    fs.writeFile(url, templateStr, (err) => {
      if (err) {
        console.log(err)
        return
      }
      console.log(`创建${lastName}文件`)
    })
  }
}
