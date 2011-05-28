try {
	try{
    	module.exports = require('./o3.node').root
	} catch(ex) {
    	module.exports = require('../build/default/o3.node').root
	}
} catch (ex) {
    if (process.platform == "cygwin")
		module.exports = require('./o3-cygwin.node').root;
	else if (process.platform == "darwin") 
        module.exports = require('./o3-darwin.node').root;
    else if(process.platform == "sunos"){
	    module.exports = require('./o3-sunos.node').root;
	}else {
        try{ 	                           
            module.exports = require('./o3-linux32.node').root;
        } catch(x){
            module.exports = require('./o3-linux64.node').root;
        }
    }
}
