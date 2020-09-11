var scriptProperties = PropertiesService.getScriptProperties();

;(function(root,factory){
  root.Toolkit = factory()
})(this,function(){
  
  var Toolkit = {};
  
  function JSONIFY(Obj,propname,filename,folderId){
    var currentFolder = getCurrentFolder();
    var folderId = folderId || currentFolder;
    var JSONExtract = JSON.stringify(Obj,null,4);
    if(scriptProperties.getProperty(propname) !== null){
      var fileId = scriptProperties.getProperty(propname);
      var file = DriveApp.getFileById(fileId);
      file.setContent(JSONExtract);
    }else{
      var file = DriveApp.createFile(filename, JSONExtract, MimeType.PLAIN_TEXT);
      DriveApp.getFolderById(folderId).addFile(file)
      fileId = file.getId();
      file.getParents().next().removeFile(file);
      scriptProperties.setProperty(propname, fileId);
    }
    return fileId;
  }
  
  function UNJSONIFY(propname,type){
    var fileId = scriptProperties.getProperty(propname); 
    if(typeof scriptProperties.getProperty(propname) == 'undefined' || !scriptProperties.getProperty(propname) || scriptProperties.getProperty(propname) === ''){
      if(type == 0){
        return {}
      }else{
        return []
      }
    }else{
      var file = DriveApp.getFileById(fileId);
      var importedObj = JSON.parse(file.getBlob().getDataAsString())
      }
    return importedObj;
  }
  
  function readFromJSON(fileId) {
    var file
    if (typeof fileId === "string") {
      file = DriveApp.getFileById(fileId);
    } else if (Object.prototype.toString.call(fileId) === "[object Object]") {
      file = fileId
    }
    var data = JSON.parse(file.getBlob().getDataAsString())
    return data
  }
  
  function writeToJSON(data, fileId) {
    if (typeof fileId === "string") {
      file = DriveApp.getFileById(fileId);
    } else if (Object.prototype.toString.call(fileId) === "[object Object]") {
      file = fileId
    }
    file.setContent(JSON.stringify(data,null,4))
  }
  
  function getCurrentFolder(){
    var thisFileId = SpreadsheetApp.getActive().getId();
    var thisFile = DriveApp.getFileById(thisFileId);
    var parentFolder = thisFile.getParents()[0].getId();
    return parentFolder;
  }
  
  function sortObject(simpleObj,orderBool){
    var keysSorted 
    if(orderBool){
      keysSorted = Object.keys(simpleObj).sort(function(a,b){return simpleObj[b]-simpleObj[a]});
    }else{
      keysSorted = Object.keys(simpleObj).sort(function(a,b){return simpleObj[a]-simpleObj[b]});
    }
    return keysSorted;
  }
  
  function indexObjArrBy(objectArr,index){
    
    var obj = {};
    
    objectArr.forEach(function(item) {
      obj[item[index]] = item;
    });
    
    return obj;
    
  }
  
  function readSheet(options,lastRowBool){
    var ssid = options.ssid || SpreadsheetApp.getActiveSpreadsheet().getId();
    var skipRows = options.skipRows || 0;
    var countBy = options.countBy || 1;
    var startCol = options.startCol || 1;
    var sheet = SpreadsheetApp.openById(options.ssid).getSheetByName(options.sheetName);
    if(lastRowBool){
      return sheet.getLastRow();
    }
    var sheetDataArray = sheet.getRange(options.headerRow,startCol,sheet.getLastRow(),sheet.getLastColumn()).getValues();
    sheetDataArray = sheetDataArray.filter(function(row){
      return row[startCol - countBy] != "";
    })
    var header = sheetDataArray[0].map(function(col){ 
      return col.trim();
    });
    var values = sheetDataArray.slice(skipRows + 1);
    var objectifiedValues = objectifyArray(values,header,options);
    var sheetObj = {};
//    var countHeader = header[countBy];
    var entriesLength = objectifiedValues.entriesDataObjArr//.filter(function(row){ return row[countHeader] != ""})
    sheetObj.sheet = sheet;
    sheetObj.header = header;
    sheetObj.lastRow = entriesLength.length + options.headerRow + skipRows;
    sheetObj.startCol = startCol;
    sheetObj.values = values;
    sheetObj.objectifiedValues = objectifiedValues;
    return sheetObj;
  }
  
  function writeToSheet(writeArr,ssid,sheetName,startRow,startCol){
    var sheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetName);
    var range = sheet.getRange(startRow,startCol,writeArr.length,writeArr[0].length);
    var a1 = range.getA1Notation();
    range.setValues(writeArr);
  }
  
  function objectifyArray(sheetDataArray,header,options){
    if(!header){
      header = sheetDataArray[0];
      sheetDataArray.shift();
      if(sheetDataArray.length == 0){
        sheetDataArray = [header.map(function(col){return ""})]
      }
    }
    var invert = options.invert || false;
    var headerRow = options.headerRow || 1;
    var skipRows = options.skipRows || 0;
    var startCol = options.startCol || 1;
    var tableName = options.tableName;
    
    var headerIndexesObj = {}; 
    
    var objArr = sheetDataArray.map(function(row,i){
      var obj = {};
      header.forEach(function(col,j){
        obj[col] = row[j];
        if(i == 0){
          headerIndexesObj[col] =  invert? headerRow + skipRows + j : options.startCol + j;
        }
      })
      obj.entryIndexInSheet = invert? i + startCol + 1 : i + headerRow + skipRows + 1;
      return obj;
    })
    var returnObj = {entriesDataObjArr: objArr, headerIndexesObj: headerIndexesObj};
    if(tableName){
      returnObj.tableName = tableName;
    }
    return returnObj;
  }
  
  function deleteRows(toDelete,ssid,sheetName){
    var sourceSheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetName);
    var delStart = toDelete[toDelete.length-1];
    var delCount = 1;
    var i;
    for (i = toDelete.length-1; i >= 0; i--) {
      if(i > 0 && toDelete[i-1] == delStart-1) {
        delCount++;
      } else {
        sourceSheet.deleteRows(toDelete[i],delCount);
        delCount = 1;
      }
      delStart = toDelete[i-1];      
    }
  }
  
  function copyObject(obj){
    var copyObj = {};
    var keys = Object.keys(obj);
    keys.forEach(function(key){
      copyObj[key] = obj[key];
    })
    return copyObj;
  }
  
  
  function objArrToArray(objArr,header,columnBool){
    var keys = header? header : Object.keys(objArr[0]);
    var array = objArr.map(function(row){
      return keys.map(function(header){
        if(columnBool){
          return [row[header]];
        }
        return row[header];
      })
    })
    return array;
  }
  
  function removeArrayElement(array,element){
    const index = array.indexOf(element);
    if (index > -1) {
      array.splice(index, 1);
    }
  }
  
  function timestampCreate(date,format){
    var dt
    if(format){
      if(date){
        dt = Utilities.formatDate(new Date(date),"GMT+2:00",format)
      }else{
        dt =  Utilities.formatDate(new Date(),"GMT+2:00",format);
      }
    }else{
      if(date){
        dt = new Date(date);
      }else{
        dt = new Date();
      }
    }
    return dt;
  }
  
  function refitTimestamp(timestamp){
    return new Date(timestamp.toString());
  }
  
  function correctEmail(email){
    var correctedEmail = email.toLowerCase();
    return correctedEmail;
  }
  
  function mergeObjects(obj_1,obj_2){
    var obj = {};
    var keys_1 = Object.keys(obj_1)
    var keys_2 = Object.keys(obj_2)
    keys_1.forEach(function(key){
      obj[key] = obj_1[key];
    })
    keys_2.forEach(function(key){
      obj[key] = obj_2[key];
    })
    return obj;
  }
  
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  
  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }
  
  function refitProperMobileNumber(mobile){
    if(mobile.length < 10){
      return 'invalid_mobile';
    }
    if(mobile[0] == '1'){ 
      return mobile = '+20' + mobile;
    }
    if(mobile[0] == '+'){ 
      return mobile;
    }
    if(mobile[0] == '2'){ 
    mobile = '+' + mobile;
    }
    return '+2' + mobile;
  }
  
  function splitArr(fullData,delimiter){
    var firstRow = fullData[0];
    var partionsArr = [];
    var datasArr = [];
    firstRow.forEach(function(element,i){
      if(element == delimiter){
        partionsArr.push(i)
      }
    })
    var from = 0, to;
    for(var i = 0; i < partionsArr.length + 1; i++){
      var stop = partionsArr[i]? partionsArr[i] : firstRow.length;
      to = from + stop;
      var part = [];
      for(var j = 0; j < fullData.length; j++){
        if(fullData[j][from] == ''){
          break;
        }
        part.push(fullData[j].slice(from,to));
      }
      from = stop + 1;
      datasArr.push(part);
    }
    return {partionsArr: partionsArr,datasArr: datasArr};
  }
  
  function invertArray(data) {
    var ret = [];
    for (var i = 0; i < data[0].length; ++i) {
      ret.push([]);
    }
    for (var i = 0; i < data.length; ++i) {
      for (var j = 0; j < data[i].length; ++j) {
        ret[j][i] = data[i][j];
      }
    }
    return ret;
  }
  
  function setValidationList(sheetObj,list,row,col,rows,cols){
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(list).build();
    if(rows && cols){
      var range = sheetObj.getRange(row,col,rows,cols);
    }else{
      var range = sheetObj.getRange(row,col);
    }
    range.setDataValidation(rule);
  }
  
  function writeToFile(obj,propName){
    var fileName = propName + '.json';
    var fileId = scriptProperties.getProperty(propName);
    var firstTimeBool;
    if(fileId == null){
      JSONIFY(obj,propName,fileName);
      firstTimeBool = true;
    }
    writeToJSON(obj,fileId);
    return {firstTimeBool: firstTimeBool,fileId: fileId};
  }
  
  function readFromFile(propName,typeBool){
    var fileId = scriptProperties.getProperty(propName);
    if(fileId == null){
      if(typeBool){
        return {};
      }
      return [];
    }
    return readFromFile(fileId);
  }
  
  function titleCase(string) {
    var sentence = string.toLowerCase().split(" ");
    for(var i = 0; i< sentence.length; i++){
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(" ");
  }
  
  function nameFormatting(firstName,lastName){
    var nameArr = [firstName.trim(), lastName.trim()]
    var titles = ['dr','mr','eng','prof','professor','mrs','ms']
    var els = ['el','al','all','abdel','abdul','abdell'];
    var cleanNameArr = nameArr.map(function(name,i){
      var nameArrP = name.split(" ");
      nameArrP = nameArrP.map(function(part){return part.trim()});
      if(nameArrP[0].indexOf(".") > -1 && nameArrP[0].indexOf(".") < nameArrP[0].length - 1){
        nameArrP = nameArrP[0].split(".").concat(nameArrP);
      }
      var arrLen = nameArrP.length
      var singleName
      if(arrLen > 1){
        var cleanedFirstPart = nameArrP[0].toLowerCase().replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
        var checkTitlesBool = titles.indexOf(cleanedFirstPart);
        if(i == 0){
          var checkElsA = els.indexOf(nameArrP[0].toLowerCase());
          var checkElsB = els.indexOf(nameArrP[1].toLowerCase());
          if(checkTitlesBool > -1){
            if(checkElsB > -1){
              singleName = nameArrP[1] + " " +  nameArrP[2];
            }else{
              singleName = nameArrP[1];
            }
          }else{
            if(checkElsA > -1){
              singleName = nameArrP[0] + nameArrP[1];
            }else{
              singleName = nameArrP[0];
            }
          }
        }else{
          checkElsC = els.indexOf(nameArrP[arrLen - 2].toLowerCase());
          if(checkElsC > -1){
            singleName = nameArrP[arrLen - 2] + " " + nameArrP[arrLen - 1];
          }else{
            singleName = nameArrP[arrLen - 1];
          }
        }
      }else{
        singleName = nameArrP[0];
      }
      return singleName.trim().replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '');
    })
    return titleCase(cleanNameArr[0]+ ' ' + cleanNameArr[1]);
  }
  
  function approximateToHalf(num){
    var calc = Math.round(num*2)/2;
    return calc;
  }
  
  function createTemplateSimple(text,variables){
    var variablesKeys = Object.keys(variables);
    variablesKeys.forEach(function(variable){
      var replacement = variables[variable];
      var regex = new RegExp("{{ " + variable + " }}", "g");
      text = text.replace(regex, replacement)
    })
    return text;
  }
  
  Toolkit.readFromJSON = readFromJSON;
  Toolkit.writeToJSON = writeToJSON;
  Toolkit.sortObject = sortObject;
  Toolkit.indexObjArrBy = indexObjArrBy;
  Toolkit.readSheet = readSheet;
  Toolkit.objectifyArray = objectifyArray;
  Toolkit.objArrToArray = objArrToArray;
  Toolkit.writeToSheet = writeToSheet;
  Toolkit.deleteRows = deleteRows;
  Toolkit.copyObject = copyObject;
  Toolkit.removeArrayElement = removeArrayElement;
  Toolkit.timestampCreate = timestampCreate;
  Toolkit.correctEmail = correctEmail;
  Toolkit.mergeObjects = mergeObjects;
  Toolkit.pad = pad;
  Toolkit.toTitleCase = toTitleCase;
  Toolkit.refitProperMobileNumber = refitProperMobileNumber;
  Toolkit.refitTimestamp = refitTimestamp;
  Toolkit.splitArr = splitArr;
  Toolkit.invertArray = invertArray;
  Toolkit.setValidationList = setValidationList;
  Toolkit.writeToFile = writeToFile;
  Toolkit.readFromFile = readFromFile;
  Toolkit.titleCase = titleCase;
  Toolkit.nameFormatting = nameFormatting;
  Toolkit.approximateToHalf = approximateToHalf;
  Toolkit.createTemplateSimple = createTemplateSimple;
  
  return Toolkit;
  
})

function getPermission(){
  SpreadsheetApp.getActive();
}
