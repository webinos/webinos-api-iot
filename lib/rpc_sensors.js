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
    var SensorModule = function(rpcH, par) {
        this.rpcHandler = rpcH;
        this.params = par;

        var impl = 'iot';
        if(typeof this.params.impl != 'undefined') {
            impl = this.params.impl;
        }

        var regFunc;
        var unregFunc;
        var dilib = null;
        var driverInterface = null;
        var sslib = null;
        var services = {};

        if (impl == 'iot') {
           sslib = require(__dirname+'/sensors_iot.js');
        }
        else if (impl == 'fake') {
            sslib = require(__dirname+'/sensor_fake.js');
        }

        this.init = function(register, unregister, di) {
            regFunc = register;
            unregFunc = unregister;
            if (impl == 'iot') {
                driverInterface = di;
                driverInterface.connect(0, driverListener);
            }
            else if (impl == 'fake') {
                var service = new sslib.SensorService(this.rpcHandler, this.params);
                regFunc(service);
            }
        };

        function driverListener(cmd, id, data) {
            if (impl == 'iot') {
                switch(cmd) {
                    case 'register':
                        //If cmd is register, then data is the type of sensor (temperature, light, ...)
                        //console.log('sensor api listener: register sensor of type '+data);
                        var service = new sslib.SensorService(rpcH, data, id, driverInterface);
                        regFunc(service);
                        services[id] = service;
                        break;
                    case 'unregister':
                        //If cmd is register, then data is the type of sensor (temperature, light, ...)
                        //console.log('sensor api listener: register sensor of type '+data);
                        console.log("unregister");
                        var service = services[id]
                        unregFunc(service);
                        delete services[id];
                        break;
                    case 'data':
                        console.log("Data from service with id "+id);
                        //console.log("RPC_sensors: sensor " + id + " has " + serviceList[id].listeners.length + " listeners");
                        if(services[id].listenerActive == true) {
                            var sensorEvent = services[id].getEvent(data);
                            var deadList = [];
                            for(var i=0; i<services[id].sensorEventListeners.length; i++){
                                if(services[id].sensorEventListeners[i][3] === "sensor"){
                                    var rpc = rpcH.createRPC(services[id].sensorEventListeners[i][2], "onEvent", sensorEvent);
                                    if (false === rpcH.executeRPC(rpc)) {
                                      deadList.push(services[id].sensorEventListeners[i][2].rpcId);
                                    }
                                }
                            }
                            deadList.forEach(function(drop) { console.log("** dropping orphaned listener **"); services[id].removeEventListener(drop); });
                        }
                        break;
                    default:
                        console.log('sensor api listener: unrecognized command');
                }
            }
        };
    };

    exports.SensorModule = SensorModule;
})();
