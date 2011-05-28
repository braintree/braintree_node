var xml = require("../lib/o3-xml"),
	doc,
	xmlData = "\
<?xml version=\"1.0\"?>\n\
<catalog>\n\
   <book id=\"bk101\" available=\"true\">\n\
      <author>Gambardella, Matthew</author>\n\
      <title>XML Developer's Guide</title>\n\
      <genre>Computer</genre>\n\
      <price>44.95</price>\n\
      <publish_date>2000-10-01</publish_date>\n\
      <description>An in-depth look at creating applications \n\
      with XML.</description>\n\
   </book>\n\
   <book id=\"bk102\" available=\"false\">\n\
      <author>Ralls, Kim</author>\n\
      <title>Midnight Rain</title>\n\
      <genre>Fantasy</genre>\n\
      <price>5.95</price>\n\
      <publish_date>2000-12-16</publish_date>\n\
      <description>A former architect battles corporate zombies, \n\
      an evil sorceress, and her own childhood to become queen \n\
      of the world.</description>\n\
   </book>\n\
</catalog>";

doc = xml.parseFromString(xmlData);
console.log("-parsed document:\n" + doc.xml);
console.log("\n-traversing document element:");
var elem = doc.documentElement,
childNodes = elem.childNodes;
for (var i=0; i<childNodes.length; i++) {
	console.log("name of child " + i + ": " 
		+ childNodes[i].nodeName);
	console.log("type of child " + i + ": " 
		+ childNodes[i].nodeName);	
}

console.log("\n-attributes on first child of the document element:");		
var child = elem.firstChild.nextSibling,
attributes = child.attributes;
console.log(child.nodeName);
for (var i=0; i<attributes.length; i++) {
	console.log("attribute " + i + ": " 
		+ attributes[i].name + " = " 
		+ attributes[i].value);
}

console.log("\n-xpath query:");
var xpathNodeList = elem.selectNodes(
	"descendant-or-self::node()[@available='true']");
console.log("first element of the xpath querry: " 
	+ xpathNodeList[0].getAttribute("id"));	