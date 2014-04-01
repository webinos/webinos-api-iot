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
    var ActuatorModule = function(rpcH, par) {
        var rpcHandler = rpcH;
        var params = par;

        var impl = 'iot';
        if(typeof params.impl != 'undefined') {
            impl = params.impl;
        }

        var regFunc;
        var unregFunc;
        var dilib = null;
        var driverInterface = null;
        var actlib = null;
        var services = {};

        if (impl == 'iot') {
            actlib = require(__dirname+'/actuators_iot.js');
        }

        this.init = function(register, unregister, di) {
            regFunc = register;
            unregFunc = unregister;
            if (impl == 'iot') {
                driverInterface = di;
                driverInterface.connect(1, driverListener);
            }
        };

        function driverListener(cmd, id, data) {
            if (impl == 'iot') {
                switch(cmd) {
                    case 'register':
                        //If cmd is register, then data is the type of sensor (temperature, light, ...)
//                      console.log('actuator api listener: register actuator of type '+data);
                        var service = new actlib.ActuatorService(rpcHandler, data, id, driverInterface);
                        regFunc(service);
                        services[id] = service;
                        break;
                    case 'unregister':
                        //If cmd is register, then data is the type of sensor (temperature, light, ...)
                        //console.log('sensor api listener: register sensor of type '+data);
                        var service = services[id]
                        unregFunc(service);
                        delete services[id];
                        break;
                    case 'value':
                        var actuatorEvent = data;
                        //handle callbacks
                        for(var i in services[id].actuatorEventCallbacks){
                            var rpc = rpcH.createRPC(services[id].actuatorEventCallbacks[i], "onEvent", actuatorEvent);
                            rpcH.executeRPC(rpc);
                        }

                        //handle listeners
                        if(services[id].listenerActive == true) {
                            for(var i=0; i<services[id].actuatorEventListeners.length; i++){
                                if(services[id].actuatorEventListeners[i][3] === "actuator"){
                                    var rpc = rpcH.createRPC(services[id].actuatorEventListeners[i][2], "onEvent", actuatorEvent);
                                    rpcH.executeRPC(rpc);
                                }
                            }
                        }
                        break;
                    case 'data':
                      console.log("Data from service with id " + id);
                      if (services[id].listenerActive == true) {
                        var sensorEvent = services[id].getEvent(data);
                        var deadList = [];
                        for (var i = 0; i < services[id].actuatorEventListeners.length; i++) {
                          if (services[id].actuatorEventListeners[i][3] === "actuator") {
                            var rpc = rpcH.createRPC(services[id].actuatorEventListeners[i][2], "onEvent", sensorEvent);
                            if (false === rpcH.executeRPC(rpc)) {
                              deadList.push(services[id].actuatorEventListeners[i][2].rpcId);
                            }
                          }
                        }
                        deadList.forEach(function(drop) { console.log("** dropping orphaned listener **"); services[id].removeEventListener(drop); });
                      }
                      break;
                    default:
                          console.log('actuator api listener: unrecognized command');
                }
            }
        };
    };
    exports.ActuatorModule = ActuatorModule;
})();
