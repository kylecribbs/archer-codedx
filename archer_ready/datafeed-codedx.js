// const dotenv = require('dotenv');
// dotenv.config();

httpRequest = require('request')
parser = require('xml2js')
fs = require('fs')

// const context = {
//   "CustomParameters": {
//     "apiKey": process.env.apiKey,
//     "baseUrl": process.env.baseUrl,
//     "apiEndpoint": process.env.apiEndpoint
//   },
//   "OutputWriter": {
//     "create": function(){}
//   }
// }


/**
 * AllocateControls class for checking adding, removing, getting controls.
 *
 * @param {String} context - Archer Context from JST
 *
 * @class
 */
class CodeDX {
  constructor (context, xmlStructure = {}) {
    this.xmlStructure = Object.assign({}, {
      headless: true,
      rootName: 'RECORD',
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n'
      }
    })
    this.xmlStructure = Object.assign(this.xmlStructure, xmlStructure)
    this.params = context.CustomParameters
    this.apiKey = this.params['apiKey']
    this.baseUrl = this.params['baseUrl']
    this.apiEndpoint = this.params['apiEndpoint']
    this.outputWriter = context.OutputWriter.create('XML', { RootNode: 'ROOT' })
  }

  transfer(data = null){
    if (data) {
      // no call back initiated
      return fs.writeFileSync(`DATAFEED_CODEDX.xml`, data)
    }
    callback(null)
  }

  /**
   * Converts json data to an xml output
   * @param {String} jsonData JSON array of records to convert
   */
  jsonArrayToXmlBuffer (jsonData, rootElement = null) {
    const responseBuilder = new parser.Builder(this.xmlStructure)
    let dataObject = typeof jsonData === 'string'
      ? JSON.parse(jsonData) : jsonData
    dataObject = Array.isArray(dataObject) ? dataObject : Array(jsonData)
    const jsData = rootElement
      ? dataObject[rootElement]
      : dataObject
    const xmlBufferArray = jsData.reduce((preVal, curVal, i, src) => {
      const xmlData = responseBuilder.buildObject(curVal)
      console.log(xmlData)
      preVal.push(Buffer.from(xmlData, 'utf8'))
      return preVal
    }, [])
    return Buffer.concat(xmlBufferArray)
  }

  requestOptions(obj = {}, path = "/api"){
    if(!obj.hasOwnProperty('method')){
      obj['method'] = "GET"
    }
    if(!obj.hasOwnProperty('url')){
      obj['url'] = `${this.baseUrl}${path}`
    }
    if(!obj.hasOwnProperty('headers')){
      obj['headers'] = {}
    }
    if(!obj.headers.hasOwnProperty('content-type')){
      obj.headers['content-type'] = "application/json"
    }
    if(!obj.headers.hasOwnProperty('API-Key')){
      obj.headers['API-Key'] = this.apiKey
    }
    if(!obj.hasOwnProperty['rejectUnauthorized']){
      obj['rejectUnauthorized'] = false
    }
    if(!obj.hasOwnProperty['json']){
      obj['json'] = true
    }
    if(!obj.hasOwnProperty('body')){
      obj['body'] = {}
    }
    //console.debug(obj)
    return obj
  }

  async run(){
    console.log(this.apiEndpoint)
    const options = this.requestOptions({}, this.apiEndpoint)
    const {body, response} = await new Promise((resolve, reject) => {
      httpRequest(options, (error, response, body) => {
        if (error) reject(error)
        if (response) resolve({ body, response })
      })
    })
    const bufferXML = this.jsonArrayToXmlBuffer(body)
    this.outputWriter.createItem(bufferXML)
  }

}

new CodeDX(context).run()