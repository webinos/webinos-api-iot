/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Ivan Glautier, Nquiring Minds
 * Copyright 2013 Giuseppe La Torre
 ******************************************************************************/

function checkEvent(event) {
    expect(event.timestamp).toEqual(jasmine.any(Number));
    expect(event.sensorType).toEqual("http://webinos.org/api/sensors/temperature");
    expect(event.accuracy).toEqual(jasmine.any(Number));
    expect(event.rate).toEqual(jasmine.any(Number));
    //expect(event.eventFireMode).toEqual(jasmine.any(String));
    expect(event.sensorValues).toEqual(jasmine.any(Array));
    expect(event.sensorValues[0]).toEqual(jasmine.any(Number));
    console.log("Temp: " + event.sensorValues[0]);
}


describe("Sensor API", function() {
    var sensorService;

    webinos.discovery.findServices(new ServiceType("http://webinos.org/api/sensors/temperature"), {
        onFound: function (service) {
            sensorService = service;
        }
    });

    beforeEach(function() {
        waitsFor(function() {
            return !!sensorService;
        }, "found service", 5000);
    });


    it("should be available from the discovery", function() {
        expect(sensorService).toBeDefined();
    });

    it("has the necessary properties as service object", function() {
        expect(sensorService.state).toBeDefined();
        expect(sensorService.api).toEqual(jasmine.any(String));
        expect(sensorService.id).toEqual(jasmine.any(String));
        expect(sensorService.displayName).toEqual(jasmine.any(String));
        expect(sensorService.description).toEqual(jasmine.any(String));
        expect(sensorService.icon).toEqual(jasmine.any(String));
        expect(sensorService.bindService).toEqual(jasmine.any(Function));
    });

    describe("with bound service", function() {
        var sensorServiceBound;

        beforeEach(function() {
            if (!sensorService) {
                waitsFor(function() {
                    return !!sensorService;
                }, "found service", 5000);
            }
            if (!sensorServiceBound) {
                sensorService.bindService({onBind: function(service) {
                    sensorServiceBound = service;
                }});
                waitsFor(function() {
                    return !!sensorServiceBound;
                }, "the service to be bound", 1000);
            }
        });

        it("can be bound", function() {
            expect(sensorServiceBound).toBeDefined();
        });


        it("has the functions as sensor API service", function() {
            expect(sensorServiceBound.configureSensor).toEqual(jasmine.any(Function));
            expect(sensorServiceBound.addEventListener).toEqual(jasmine.any(Function));
            expect(sensorServiceBound.removeEventListener).toEqual(jasmine.any(Function));
        });


        it("can get successive temperature values updates using addEventListener", function() {
            var counter = 0;
            var temperature_event;

            function onSensorEvent(event){
                counter++;
                temperature_event = event;
            }

            sensorServiceBound.addEventListener('sensor', onSensorEvent, false);

            waitsFor(function() {
                return counter > 1;
            }, "addEventListener being called multiple times", 6000);

            runs(function() {
                expect(counter).toBeGreaterThan(1);
                sensorServiceBound.removeEventListener('sensor', onSensorEvent, false);
                var tmpCounter = counter;

                checkEvent(temperature_event);
                expect(tmpCounter).toEqual(counter);
            });
        });


        it("can remove event listener", function() {
            var counter = 0;

            function onSensorEvent(event){
                counter++;
            }

            sensorServiceBound.addEventListener('sensor', onSensorEvent, false);

            waitsFor(function() {
                if(counter == 1){
                    sensorServiceBound.removeEventListener('sensor', onSensorEvent, false);
                    return true;
                }
                return false;
            }, "addEventListener being called", 5000);

            waits(3000);

            runs(function() {
                expect(counter).toEqual(1);
            });
        });

        it("can support multiple addEventListener", function() {
            var event1, event2;
            
            function onSensorEvent1(event){
                event1 = event;
                sensorServiceBound.removeEventListener('sensor', onSensorEvent1, false);
            }
            function onSensorEvent2(event){
                event2 = event;
                sensorServiceBound.removeEventListener('sensor', onSensorEvent2, false);
            }

            sensorServiceBound.addEventListener('sensor', onSensorEvent1, false);
            sensorServiceBound.addEventListener('sensor', onSensorEvent2, false);

            
            waitsFor(function() {
                return !!event1 & !!event2;
            }, "all listeners being called", 5000);

            runs(function() {
                checkEvent(event1);
                checkEvent(event2);
                expect(event1).toEqual(event2);
            });
        });
    });
});
