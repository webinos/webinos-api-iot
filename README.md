# webinos IoT API #

**Service Type**: http://webinos.org/api/sensors/*

webinos IoT API exposes multiple IoT sensors and actuators connected to your personal zone. The * in the service type indicates that multiple services exist. For example the service type "http://webinos.org/api/sensors/light" requests from webinos a light sensor service. 

Sensors and actuators can be exposed by the IoT api by installing drivers and configuring the API.

## Installation ##

To install the IoT API you will need to npm the node module inside the webinos pzp.

For end users, you can simply open a command prompt in the root of your webinos-pzp and do: 

	npm install https://github.com/webinos/webinos-api-iot.git

For developers that want to tweak the API, you should fork this repository and clone your fork inside the node_module of your pzp.

	cd node_modules
	git clone https://github.com/<your GitHub account>/webinos-api-iot.git
	cd webinos-api-iot
	npm install

### Installing additional drivers

It is possible to add additional drivers cloning them into *webinos-api-iot/node_modules* folder and then install them using *npm install*.


## Getting a reference to the service ##

To discover all available IoT devices, you will have to search for the "http://webinos.org/api/sensors/*" type. Example:

	var serviceType = "http://webinos.org/api/sensors/*";
	webinos.discovery.findServices( new ServiceType(serviceType), 
		{ 
			onFound: serviceFoundFn, 
			onError: handleErrorFn
		}
	);
	function serviceFoundFn(service){
		// Do something with the IoT services
	};
	function handleErrorFn(error){
		// Notify user
		console.log(error.message);
	}

Alternatively you can use the webinos dashboard to allow the user choose the sensor of actuator to use. Example:
 	
	webinos.dashboard.open({
         module:'explorer',
	     data:{
         	service:[
            	'http://webinos.org/api/sensors/*'
         	],
            select:"services"
         }
     }).onAction(function successFn(data){
		  if (data.result.length > 0){
			// User selected some services
		  }
	 });

## Methods ##

Once you have a reference to an instance, depending on the type (sensor or actuator) you can use the following methods.

### Sensors

#### configureSensor (params, successCB, errorCB) 

Configure the sensor based on the given params.

#### addEventListener (eventType, successCB, errorCB) 

Listen for an event.

#### removeEventListener (eventType, successCB, errorCB) 

Remove the added event listen.


### Actuators

#### setValue (setValue, successCB, errorCB) 

Set the value of the actuator.

#### addEventListener (eventType, successCB, errorCB) 

Listen for an event.

#### removeEventListener (eventType, successCB, errorCB) 

Remove the added event listen.
 

## Links ##

- [Examples](https://github.com/webinos/webinos-api-iot/wiki/Examples)

