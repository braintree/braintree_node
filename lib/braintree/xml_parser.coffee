{DomJS} = require("dom-js")
{Util} = require('./util')

class XmlParser
  TEXT_NODE = 3

  @parse: (text, callback) ->
    unless callback?
      throw "No parse callback provided (ABC)"
    new XmlParser().parse(text, callback)

  convertNodeToObject: (node) ->
    object = {}
    obj = {}
    
    for child in node.children
      unless typeof child.text == "string"
        name = Util.toCamelCase child.name
        if child.children.length is 1 and typeof child.children[0].text == "string"
          if child.attributes?.type == 'boolean'
            obj[name] = child.children[0].text == 'true'
          else
            obj[name] = child.children[0].text
        else if child.children.length is 0 and child.attributes.nil?
          obj[name] = null
        else if child.children.length is 0 and child.attributes.type == 'array'
          obj[name] = []
        else if child.attributes.type == 'array'
          obj[name] = (@convertNodeToObject(arrayItem)[Util.toCamelCase(arrayItem.name)] for arrayItem in child.children when typeof arrayItem.text != "string")
        else if child.children.length == 0 and (for own key of child.attributes then key).length == 0
          obj[name] = ''
        else
          obj[name] = @convertNodeToObject(child)[Util.toCamelCase(child.name)]
    object[Util.toCamelCase(node.name)] = obj
    object

  parse: (body, callback) ->
    domjs = new DomJS
    domjs.parse body, (err, dom)=>
      callback? err, @convertNodeToObject dom

exports.XmlParser = XmlParser
