/*******************************************************************************
 *  Code contributed to the webinos project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Author: Giuseppe La Torre (giuseppe.latorre@dieei.unict.it)
 * Author: Stefano Vercelli (stefano.vercelli@telecomitalia.it)
 *
 ******************************************************************************/

(function() {
    var RPCWebinosService = require("webinos-jsonrpc2").RPCWebinosService;

    var ActuatorService = function(rpcHandler, data, id, drvInt) {

        // inherits from RPCWebinosService
        this.base = RPCWebinosService;
        var driverInterface = drvInt;
        this.objRef = null;
        var type = data;

        var name;
        var description;
        
        this.actuatorEventListeners = [];
        this.actuatorEventCallbacks = {};

        this.range = null;
        this.unit = null;
        this.vendor = null;  
        this.version = null;
        this.elementId = id;

        var type;
//        console.log("Called actuator ctor with params " + JSON.stringify(data));

        if(data.type) {
            type = data.type;
        }

        if(data.name) {
            name = data.name;
        }
        else{
            name = type+' actuator';
        }
    
        if(data.description) {
            description = data.description;
        }
        else{
            description = 'A webinos '+type+' actuator';
        }
        
        if(data.range){
            this.range = data.range;
        }

        if(data.unit){
            this.unit = data.unit;
        }

        if(data.vendor){
            this.vendor = data.vendor;
        }

        if(data.version){
            this.version = data.version;
        }

        var actuatorEvent = {};
        actuatorEvent.actuatorType = 'http://webinos.org/api/actuators/' + type;
        actuatorEvent.actuatorId = this.id;

        actuatorEvent.actualValue = null;
        
        this.base({
            api: 'http://webinos.org/api/actuators/'+type,
            displayName: name,
            description: description //+' - id '+id
        });

        this.getEvent = function (data) {
            if(data != null) {
                try {
                    var tmp = JSON.parse(data);
                    if(tmp instanceof Array) {
                        actuatorEvent.actualValue = tmp;
                    }
                    else {
                        sensorEvent.sensorValues = new Array;
                        sensorEvent.sensorValues[0] = tmp;
                    }

                    actuatorEvent.timestamp = new Date().getTime();  
                }
                catch(e) {
                    //console.log('Sensor event error: cannot convert data to array of values');
                    //sensorEvent.sensorValues = null;
                    actuatorEvent.actualValue = new Array();
                    actuatorEvent.actualValue[0] = tmp;
                }
            }

            actuatorEvent.actuatorId = this.id;
            return actuatorEvent;
        }            
        
	/**
        * Get some initial static actuator data.
        * @param params (unused)
        * @param successCB Issued when actuator configuration succeeded.
        * @param errorCB Issued if actuator configuration fails.
        */
        this.getStaticData = function (params, successCB, errorCB){
            var tmp = {};
            tmp.range = this.range;
            tmp.unit = this.unit;
            tmp.vendor = this.vendor;  
            tmp.version = this.version;
            successCB(tmp);
        };
        
        var CmdErrorHandler = function(rpcErrorCB) {
            this.rpcErrorCB = rpcErrorCB;      
            this.errorCB = function(message) {
                rpcErrorCB(message);
            };
        };

        this.setValue = function(value, successCB, errorCB, objectRef) {
            //console.log("value : " +value);
            //console.log("successCB : " +successCB);
            //console.log("errorCB : " +errorCB);
            //console.log("objectRef : " +JSON.stringify(objectRef));
            this.actuatorEventCallbacks[objectRef.from] = objectRef;
            var evt = this.getEvent(value);
            driverInterface.sendCommand('value', this.elementId, evt, errorCB, successCB);
        };

        this.addEventListener = function (eventType, successCB, errorCB, objectRef) {
            //console.log("Sensor:addEventListener - eventType : " +eventType);
            //console.log("Sensor:addEventListener - successCB : " +successCB);
            //console.log("Sensor:addEventListener - errorCB : " +errorCB);
            //console.log("Sensor:addEventListener - objectRef : " +JSON.stringify(objectRef));
            this.objRef = objectRef;
            this.listenerActive = true;
            this.actuatorEventListeners.push([successCB, errorCB, objectRef, eventType]);
            var evt = this.getEvent(0);
            driverInterface.sendCommand('value', this.elementId, evt, errorCB, successCB);
        };

        this.removeEventListener = function (arguments) {
            for (i = 0; i < this.actuatorEventListeners.length; i++) {
                if(this.actuatorEventListeners[i][2].rpcId === arguments[0]){
                    this.actuatorEventListeners.splice(i, 1);
                    break;
                }
            }

            if(this.actuatorEventListeners.length == 0){
                console.log("Stopping listen to actuator " + this.id);
                this.listenerActive = false;
            }
        };
    }

    ActuatorService.prototype = new RPCWebinosService;

    exports.ActuatorService = ActuatorService;

})();
