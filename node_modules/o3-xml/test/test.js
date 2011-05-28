var fs = require('fs');
var sys = require('sys');
var xml = require("../lib/o3-xml");

function diff(node, node1) {
    if (node.nodeType != node1.nodeType)
        return false;
    if (node.nodeName != node1.nodeName)
        return false;
    if (node.nodeValue != node1.nodeValue)
        return false;
    switch (node.nodeType) {
    case node.DOCUMENT:
        return diff(node.documentElement, node1.documentElement);
    case node.ELEMENT:
        var childNodes;
        var attributes;
        var length;

        childNodes = node.childNodes;
        length = childNodes.length;
        if (length != node1.childNodes.length)
            return false;
        for (var i = 0; i < length; ++i) {
            if (!diff(childNodes[i], node1.childNodes[i]))
                return false;
        }
        attributes = node.attributes;
        length = attributes.length;
        if (length != node1.attributes.length)
            return false;
        for (var i = 0; i < length; ++i) {
            if (!diff(attributes[i], node1.attributes[i]))
                return false;
        }
        return true;
    case node.ATTRIBUTE:
        return true;
    default:
        return true;
    };
}

function check(expected,actual) {
	var l = expected.length;	
	if (l != actual.length) {
		console.log('expected no: ' + expected.length
			+ '\n\nactual no: ' + actual.length);	
		return false;
	}
	
	for (var i=0; i<l; i++) {
		if (expected[i] != actual[i]) {
			console.log('expected: ' + expected.toString()
				+ '\n\nactual: ' + actual.toString());	

			return false;
		}
	}
	
	return true;		
}

function readFile(file) {
    file = __dirname + "/" + file;
	var size = fs.statSync(file).size,
		buf = new Buffer(size),
		fd = fs.openSync(file, 'r');
	if (!size)
		return "";
	fs.readSync(fd, buf, 0, size, 0);
	fs.closeSync(fd);
	return buf.toString();
} 

var test = {
test0 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];

    ref_parent.insertBefore(elem.childNodes[1].childNodes[3],
                            ref_parent.childNodes[3]);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test0.xml")));
},

test1 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[1];

    ref_parent.insertBefore(elem.childNodes[1].childNodes[3],
                            ref_parent.childNodes[7]);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test1.xml")));
},

test2 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[1];

    ref_parent.insertBefore(elem.childNodes[1].childNodes[3], ref_parent.childNodes[4])
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test2.xml")));
},

test3 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[1];

    ref_parent.insertBefore(doc.createElement("subtitle"), ref_parent.childNodes[7])
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test3.xml")));
},

test4 : function() {
    var elem        = xml.parseFromString(readFile("test.xml")).
                      documentElement,
        ref_parent  = elem.childNodes[1];

    try {
        ref_parent.insertBefore(xml.parseFromString(readFile("test.xml")).
                                createElement("subtitle"), to.childNodes[7])
        return false;
    } catch (ex) {
        return true;
    }
},

test5 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];

    ref_parent.appendChild(elem.childNodes[1].childNodes[3]);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test5.xml")));
},

test6 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[1];

    ref_parent.appendChild(ref_parent.childNodes[3]);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test6.xml")));
},

test7 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[1];

    elem.normalize();
    ref_parent.appendChild(ref_parent.childNodes[12]);
    return diff(doc, xml.parseFromString(readFile("test7.xml")));
},

test8 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.documentElement,
        to      = elem.childNodes[1];

    to.appendChild(doc.createElement("subtitle"));
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test8.xml")));
},

test9 : function() {
    var elem        = xml.parseFromString(readFile("test.xml")).
                      documentElement,
        ref_parent  = elem.childNodes[1];

    try {
        ref_parent.appendChild(xml.parseFromString(readFile("test.xml")).
                               createElement("subtitle"))
        return false;
    } catch (ex) {
        return true;
    }
},

test10 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];

    try {
        ref_parent.insertBefore(elem, ref_parent.childNodes[3]);
        return false;
    } catch (ex) {
        return true;
    }
},

test11 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];

    try {
        ref_parent.appendChild(elem);
        return false;
    } catch (ex) {
        return true;
    }
},

test12 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];

    try {
        ref_parent.insertBefore(null, ref_parent.childNodes[3]);
        return false;
    } catch (ex) {
        return true;
    }
},

test13 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];
        child       = ref_parent.removeChild(ref_parent.childNodes[3]);

    elem.normalize();
    return !child.parent
        && diff(doc, xml.parseFromString(readFile("test13.xml")));
},

test14 : function() {
	return true; // turned off
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];
    
    ref_parent.removeChild(ref_parent.childNodes[3]);
    try {
        ref_parent.removeChild(child);
        return false;
    } catch (ex) {
        return true;
    }
},

test15 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3];
    
    try {
        ref_parent.removeChild(null);
        return false;
    } catch (ex) {
        return true;
    }
},

test16 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.getElementById("bk102");  

    elem.normalize();
    return elem.parentNode.nodeName == "catalog"
        && diff(elem, xml.parseFromString(readFile("test16.xml")).
                documentElement);
},

test17 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.getElementById("bk103");  

    return !elem;
},

test18 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elems   = doc.getElementsByTagName("book"),
        elem    = elems[1];

    elem.normalize();
    return elems.length = 2
        && elem.parentNode.nodeName == "catalog"
        && diff(elem, xml.parseFromString(readFile("test18.xml")).
                documentElement);
},

test19 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elems   = doc.getElementsByTagName("shelf"),
        elem    = elems[0];  

    return elems.length == 0
        && !elem;
},

test20 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.documentElement.childNodes[3];

    return elem.getAttribute("id") == "bk102";
},

test21 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.documentElement.childNodes[3];

    return !elem.getAttribute("isbn");
},

test22 : function() {
	return true; // turned off
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.documentElement.childNodes[3];

    try {
        elem.getAttribute("@id");
        return false;
    } catch (ex) {
        return true;
    }
},

test23 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement;
        ref_parent  = elem.childNodes[3];

    ref_parent.setAttribute("id", "bk103");
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test23.xml")));
},

test24 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement;
        ref_parent  = elem.childNodes[3];

    ref_parent.setAttribute("isbn", "9783161484100");
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test24.xml")));
},

test25 : function() {
	return true; // turned off
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.documentElement.childNodes[3];

    try {
        elem.setAttribute("@id", "bk103");
        return false;
    } catch (ex) {
        return true;
    }
},

test26 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        attr    = doc.createAttribute("isbn");

    attr.nodeValue = "9783161484100";
    return attr.ownerDocument = doc
        && !attr.parent
        && attr.nodeType == attr.ATTRIBUTE
        && attr.nodeName ==  "isbn"
        && attr.nodeValue == "9783161484100";
},

test27 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3],
        attr        = doc.createAttribute("isbn");

    attr.nodeValue = "9783161484100";
    ref_parent.setAttributeNode(attr);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test27.xml")));
},

test28 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3],
        attr        = ref_parent.getAttributeNode("id");
    
    ref_parent.setAttributeNode(attr);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test28.xml")));
},

test29 : function() {
    var doc         = xml.parseFromString(readFile("test.xml")),
        elem        = doc.documentElement,
        ref_parent  = elem.childNodes[3],
        attr        = elem.childNodes[1].getAttributeNode("id");
    
    ref_parent.setAttributeNode(attr);
    elem.normalize();
    return diff(doc, xml.parseFromString(readFile("test29.xml")));
},

test30 : function() {
    var elem        = xml.parseFromString(readFile("test.xml")).
                      documentElement,
        ref_parent  = elem.childNodes[3];
    
    try {
        ref_parent.setAttributeNode(xml.parseFromString(readFile("test.xml")).
                                    createAttribute("subtitle"))
        return false;
    } catch (ex) {
        return true;
    }
},

test31 : function() {
    var doc     = xml.parseFromString(readFile("test.xml")),
        elem    = doc.createElement("element"),
        attr    = doc.createAttribute("attribute"),
        text    = doc.createTextNode("Lorem ipsum");
        cdata   = doc.createCDATASection("Lorem ipsum");
        comment = doc.createComment("Lorem ipsum");

    return elem.nodeType == elem.ELEMENT && elem.nodeName == "element" && !elem.parent
        && attr.nodeType == attr.ATTRIBUTE && attr.nodeName == "attribute" && !attr.parent
        && text.nodeType == text.TEXT && text.nodeValue == "Lorem ipsum" && !text.parent
        && cdata.nodeType == cdata.CDATA_SECTION && cdata.nodeValue == "Lorem ipsum" && !cdata.parent
        && comment.nodeType == cdata.COMMENT && comment.nodeValue == "Lorem ipsum" && !comment.parent;
},

test32 : function() {
	var elem = xml.parseFromString(
			readFile('xpath.xml')).documentElement,
	expected = ['Everyday Italian','Harry Potter',
		'XQuery Kick Start','Learning XML'],
	actual = [],
	xpath = '/bookstore/book/title';

	
	var selected = elem.selectNodes(xpath);
	for (var i=0; i<selected.length; i++) 
		actual.push(selected[i].nodeValue);
	
	return check(expected, actual);
},

test33 : function() {
	var elem = xml.parseFromString(
			readFile('xpath.xml')).documentElement,
	expected = ['Everyday Italian'],
	actual = [],
	xpath = '/bookstore/book[1]/title';

	
	var selected = elem.selectNodes(xpath);
	for (var i=0; i<selected.length; i++) 
		actual.push(selected[i].nodeValue);
	
	return check(expected, actual);
},

test34 : function() {
	var elem = xml.parseFromString(
			readFile('xpath.xml')).documentElement,
	expected = [30.00,29.99,49.99,39.95],
	actual = [],
	xpath = '/bookstore/book/price/text()';

	
	var selected = elem.selectNodes(xpath);
	for (var i=0; i<selected.length; i++) 
		actual.push(selected[i].nodeValue);
	
	return check(expected, actual);
},

test35 : function() {
	var elem = xml.parseFromString(
			readFile('xpath.xml')).documentElement,
	expected = [49.99,39.95],
	actual = [],
	xpath = '/bookstore/book[price>35]/price ';

	
	var selected = elem.selectNodes(xpath);
	for (var i=0; i<selected.length; i++) 
		actual.push(selected[i].nodeValue);
	
	return check(expected, actual);
},

test36 : function() {
	var elem = xml.parseFromString(
			readFile('xpath.xml')).documentElement,
	expected = ['Everyday Italian','Harry Potter',
		'XQuery Kick Start','Learning XML'],
	actual = [],
	xpath = "descendant-or-self::node()[@lang='en']";

	
	var selected = elem.selectNodes(xpath);
	for (var i=0; i<selected.length; i++) 
		actual.push(selected[i].nodeValue);
	
	return check(expected, actual);
}

};


for (var i in test) {
    
    if (test[i]())
        console.log("test " + i + " succeeded\n");
    else {
        console.log("test " + i + " failed\n");
        break;
    }
}
