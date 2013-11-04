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
    var IotModule = function(rpcH, par){
        var rpcHandler = rpcH;
        var params = par;
        
        var actlib = null;
        var senslib = null;
        var dilib = null;

        try{
            var actlib = require(__dirname + "/rpc_actuators.js");
            var senslib = require(__dirname + "/rpc_sensors.js");
            var dilib = require(__dirname + "/driverInterface.js");
        }
        catch(e){
            console.log(e);
        }

        this.actuatorModule = null;
        this.sensorModule = null;

        this.init = function(register, unregister) {
            regFunc = register;
            unregFunc = unregister;
            
            var driverInterface = new dilib.driverInterface();

            this.actuatorModule = new actlib.ActuatorModule(rpcH, par);
            this.actuatorModule.init(register,unregister, driverInterface);

            this.sensorModule = new senslib.SensorModule(rpcH, par);
            this.sensorModule.init(register,unregister, driverInterface);

            driverInterface.start(params._submodules);
        };
    }

    exports.Module = IotModule;
})();
