(function () {
    var fs = require('fs');
    var path = require("path");
    var driversLocation = __dirname+'/drivers/';

    exports.getDrivers = function(){
        var driverFiles = fs.readdirSync(driversLocation);
        var drivers = new Array();

        for(var i in driverFiles){
            try {
//                console.log("Try to load driver " + driverFiles[i]);
                drivers.push(require(driversLocation + driverFiles[i]));
            }
            catch(e) {
                console.log('Error: cannot load driver ' + driverFiles[i]);
                console.log(e.message);
            }
        }
        return drivers;
    };

}()); 
