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

    var sensorListeners = new Array();

    /**
     * Webinos Sensor service constructor (client side).
     * @constructor
     * @param obj Object containing displayName, api, etc.
     */
    Sensor = function(obj) {
       this.base = WebinosService;
       this.base(obj);
    };
    Sensor.prototype = new WebinosService;
    
    /**
     * To bind the service.
     * @param bindCB BindCallback object.
     */
    Sensor.prototype.bind = function(bindCB) {             
        var self = this;
        var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
        
        webinos.rpcHandler.executeRPC(rpc,
            function (result){
            
                self.maximumRange = result.maximumRange;
                self.minDelay = result.minDelay;
                self.power = result.power;
                self.resolution = result.resolution;
                self.vendor = result.vendor;  
                self.version = result.version; 
            
                if (typeof bindCB.onBind === 'function') {
                    bindCB.onBind(this);
                };
            },
            function (error){
                
            }
        );

    };
    
    Sensor.prototype.configureSensor = function(params, successHandler, errorHandler){
        var rpc = webinos.rpcHandler.createRPC(this, 'configureSensor', params);
        webinos.rpcHandler.executeRPC(rpc, function () {
                successHandler();
            },
            function (error) {
                errorHandler(error);
            });
    };

    Sensor.prototype.addEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", eventType);
        sensorListeners.push([rpc.id, eventHandler, this.id]);
        rpc.onEvent = function (sensorEvent) {
            eventHandler(sensorEvent);
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    };

    Sensor.prototype.removeEventListener = function(eventType, eventHandler, capture) {
        for (var i = 0; i < sensorListeners.length; i++) {
            if (sensorListeners[i][1] == eventHandler && sensorListeners[i][2] == this.id) {
                var arguments = new Array();
                arguments[0] = sensorListeners[i][0];
                arguments[1] = eventType;
                var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
                webinos.rpcHandler.executeRPC(rpc);
                sensorListeners.splice(i,1);
                break;
            }
        }
    };
}());


(function() {

    var actuatorListeners = new Array();
    
    /**
     * Webinos Actuator service constructor (client side).
     * @constructor
     * @param obj Object containing displayName, api, etc.
     */
    ActuatorModule = function(obj) {
        this.base = WebinosService;
        this.base(obj);
    };
    
    ActuatorModule.prototype = new WebinosService();

    /**
     * To bind the service.
     * @param bindCB BindCallback object.
     */
    ActuatorModule.prototype.bind = function(bindCB) {
            var self = this;
            var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
            webinos.rpcHandler.executeRPC(rpc,
                function (result){
            
                    self.range = result.range;
                    self.unit = result.unit;
                    self.vendor = result.vendor;
                    self.version = result.version;
                    if (typeof bindCB.onBind === 'function') {
                        bindCB.onBind(self);
                    }
                },
                function (error){
                    
                }
            );
    };
    
    /**
     * Launches an application.
     * @param successCallback Success callback.
     * @param errorCallback Error callback.
     * @param applicationID Application ID to be launched.
     * @param params Parameters for starting the application.
    */
    ActuatorModule.prototype.setValue = function (value, successCB, errorCallback){
        var rpc = webinos.rpcHandler.createRPC(this, "setValue", value);        
        rpc.onEvent = function (actuatorEvent) {
            successCB(actuatorEvent);
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);        
    };
    
    ActuatorModule.prototype.addEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", eventType);
        actuatorListeners.push([rpc.id, eventHandler, this.id]);
        rpc.onEvent = function (actuatorEvent) {
            eventHandler(actuatorEvent);
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc);
    };

    ActuatorModule.prototype.removeEventListener = function(eventType, eventHandler, capture) {
        for (var i = 0; i < actuatorListeners.length; i++) {
            if (actuatorListeners[i][1] == eventHandler && actuatorListeners[i][2] == this.id) {
                var arguments = new Array();
                arguments[0] = actuatorListeners[i][0];
                arguments[1] = eventType;
                var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
                webinos.rpcHandler.executeRPC(rpc);
                actuatorListeners.splice(i,1);
                break;
            }
        }
    };
}());

