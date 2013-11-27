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
 * Copyright 2013 Giuseppe La Torre
 ******************************************************************************/

function checkEvent(event) {
    expect(event.timestamp).toEqual(jasmine.any(Number));
    expect(event.actuatorType).toEqual("http://webinos.org/api/actuators/linearmotor");
    expect(event.actualValue).toEqual(jasmine.any(Array));
    expect(event.actualValue[0]).toEqual(jasmine.any(Number));
}


describe("Actuators API", function() {
    var actuatorService;

    webinos.discovery.findServices(new ServiceType("http://webinos.org/api/actuators/linearmotor"), {
        onFound: function (service) {
            if(service.displayName == "Test linearmotor actuator")
                actuatorService = service;
        }
    });

    beforeEach(function() {
        waitsFor(function() {
            return !!actuatorService;
        }, "found service", 5000);
    });


    it("should be available from the discovery", function() {
        expect(actuatorService).toBeDefined();
    });

    it("has the necessary properties as service object", function() {
        expect(actuatorService.state).toBeDefined();
        expect(actuatorService.api).toEqual(jasmine.any(String));
        expect(actuatorService.id).toEqual(jasmine.any(String));
        expect(actuatorService.displayName).toEqual(jasmine.any(String));
        expect(actuatorService.description).toEqual(jasmine.any(String));
        expect(actuatorService.icon).toEqual(jasmine.any(String));
        expect(actuatorService.bindService).toEqual(jasmine.any(Function));
    });

    describe("with bound service", function() {
        var actuatorServiceBound;

        beforeEach(function() {
            if (!actuatorService) {
                waitsFor(function() {
                    return !!actuatorService;
                }, "found service", 5000);
            }
            if (!actuatorServiceBound) {
                actuatorService.bindService({onBind: function(service) {
                    
                    actuatorServiceBound = service;
                }});

                waitsFor(function() {
                    return !!actuatorServiceBound;
                }, "the service to be bound", 1000);
            }
        });

        it("can be bound", function() {
            expect(actuatorServiceBound).toBeDefined();
        });


        it("has the functions as actuator API service", function() {
            expect(actuatorServiceBound.setValue).toEqual(jasmine.any(Function));
            expect(actuatorServiceBound.addEventListener).toEqual(jasmine.any(Function));
            expect(actuatorServiceBound.removeEventListener).toEqual(jasmine.any(Function));
        });


        it("actuator event is generated properly", function() {
            var actuator_event;

            function onActuatorEvent(event){
                actuator_event = event;
            }

            actuatorServiceBound.setValue([5],onActuatorEvent,null);

            waitsFor(function() {
                return !!actuator_event;
            }, "addEventListener doesn't work properly", 6000);

            runs(function() {
                checkEvent(actuator_event);
                expect(actuator_event).toEqual(jasmine.any(Object));
            });
        });

        it("addEventListeners works", function() {
            var val1 = -1;
            var val2 = -1;
            var actuator_event;

            function onActuatorEvent(event){
                //actuator_event = event;
                val1 = event.actualValue[0];
            }

            actuatorServiceBound.addEventListener('actuator', onActuatorEvent, false);
            actuatorServiceBound.setValue([5],
                function(actuatorEvent){
                    val2 = actuatorEvent.actualValue[0];
                },null);

            waits(1000);
            actuatorServiceBound.removeEventListener('actuator', onActuatorEvent, false);

            waitsFor(function() {
                if(val1==val2)
                    return true;
            }, "addEventListener doesn't work properly", 6000);

            runs(function() {
                expect(val1).toEqual(val2);
            });
        });

        it("removeEventListeners works", function() {
            var val1 = -1;
            var val2 = -1;
            var actuator_event;

            function onActuatorEvent2(event){
                //actuator_event = event;
                
                val1 = event.actualValue[0];
            }

            actuatorServiceBound.addEventListener('actuator', onActuatorEvent2, false);
            actuatorServiceBound.setValue([5],
                function(actuatorEvent){
                    val2 = actuatorEvent.actualValue[0];
                },null);

            waits(1000);
            actuatorServiceBound.removeEventListener('actuator', onActuatorEvent2, false);
            waits(1000);
            actuatorServiceBound.setValue([10],
                function(actuatorEvent){
                    val2 = actuatorEvent.actualValue[0];
                },null);

            waitsFor(function() {
                if(val1!=val2)
                    return true;
            }, "removeEventListener doen't work properly", 6000);

            runs(function() {
                expect(val1).toEqual(5);
                expect(val2).toEqual(10);
            });
        });
    });
});

describe("Arduino Test", function() {
    var actuatorService;
    var arduinoSerialTest = "fake_arduino_test_actuator_serial";
    var arduinoHttpTest = "fake_arduino_test_actuator_http";
    var arduinoSerialIsOk = false;
    var arduinoHttpIsOk = false;

    webinos.discovery.findServices(new ServiceType("http://webinos.org/api/actuators/test"), {
        onFound: function (service) {
            actuatorService = service;
        }
    });

    beforeEach(function() {
        waitsFor(function() {
            return !!actuatorService;
        }, "found service", 5000);
    });


    it("should be available from the discovery", function() {
        expect(actuatorService).toBeDefined();
    });

    it("has the necessary properties as service object", function() {
        expect(actuatorService.state).toBeDefined();
        expect(actuatorService.api).toEqual(jasmine.any(String));
        expect(actuatorService.id).toEqual(jasmine.any(String));
        expect(actuatorService.displayName).toEqual(jasmine.any(String));
        expect(actuatorService.description).toEqual(jasmine.any(String));
        expect(actuatorService.icon).toEqual(jasmine.any(String));
        expect(actuatorService.bindService).toEqual(jasmine.any(Function));
    });

    describe("with bound service", function() {
        var actuatorServiceBound;

        beforeEach(function() {
            if (!actuatorService) {
                waitsFor(function() {
                    return !!actuatorService;
                }, "found service", 5000);
            }
            if (!actuatorServiceBound) {
                actuatorService.bindService({onBind: function(service) {
                    actuatorServiceBound = service;
                    if(service.displayName == arduinoSerialTest){
                        arduinoSerialIsOk = true;
                    }
                    if(service.displayName == arduinoHttpTest){
                        arduinoHttpIsOk = true;
                    }
                }});
                waitsFor(function() {
                    return !!actuatorServiceBound;
                }, "the service to be bound", 1000);
            }
        });

        it("can be bound", function() {
            expect(actuatorServiceBound).toBeDefined();
        });

        it("Arduino works with serial driver", function() {
            expect(arduinoSerialIsOk).toEqual(true);
        });

        it("Arduino works with HTTP driver", function() {
            expect(arduinoHttpIsOk).toEqual(true);
        });
    });
});
