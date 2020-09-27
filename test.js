var a = `{
  "hangzhou": [
    {
      "fid": "1637",
      "modelId": "10001",
      "strname": "租房",
      "cover": "http://att2.citysbs.com/hangzhou/2019/06/27/20/middle_48x61-200409_v2_12831561637049280_f0e3752767d19bb7a231778b230c7446.png"
    }
  ]
}
`
var jsonObj = JSON.parse(a);
var configObj = makeConfigJSON("",jsonObj,"");
//                          {}, hangzhou,[{item}], ''
//                          [], 0 ,{item}, 'hangzhou[0]'
function makeConfigJSON(key,item,path){
    var config;
    var isJSON = isObjectOrArray(item);
    if (isJSON){
       if (Array.isArray(item)){
           config = {}
           config[key] = {
               path: isNumber(key)?path:path?path+key:key,
               alias: "3",
               type: "ArrayList",
               editable: "false",
               require: "true",
               items: []
           }
           for (var i = 0; i < item.length; i++) {
               config[key].items[i] = makeConfigJSON(i,item[i],config[key].path+'['+i+']')
           }
           return config
       } else {
           config = {
               path: isNumber(key)?path:path+key,
               alias: "1",
               type: "HashMap",
               editable: "false",
               require: "true"
           }
           for (var itemKey in item) {
               var sonItem = item[itemKey]
                   config[itemKey] = {}
                   config[itemKey] = makeConfigJSON(itemKey,sonItem,config.path)
           }
           return config
       }
    } else {
        return {
            require: "false",
            path: path+'.'+key,
            alias: "",
            type: "String",
            editable: "true"
        }
    }
}
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
function getDataType(data) {
    return Object.prototype.toString.call(data).slice(8, -1).toLowerCase()
}
function isObjectOrArray(source) {
    return ['array', 'object'].includes(getDataType(source))
}
console.log(configObj)
