webinos-driver-zephyrHRM
===================

Webinos Zephyr HRM driver handler that read data from Zephyr Heart Rate Monitor via bluetooth.


##Setup

### Bluetooth Pairing in Linux

To pair the heart rate monitor with your Linux PC, go to Bluetooth Settings (pull your bluetooth icon from right corner of screen or go to system settings)

	Bluetooth Settings -> choose "+" to add new device -> HXxxx device should show on your found device list -> choose SpO2 ->continue -> choose "PIN options" -> Custom PIN -> input "1234" as the pin -> continue


###Mount as a serial port in /dev  in Linux

Release /dev/rfcomm0 if it exists

sudo rfcomm release /dev/rfcomm0


For Linux, in command line, do the following -

	hcitool scan

It will return MAC address of your oximeter. 

	sudo rfcomm bind /dev/rfcomm0 [MAC addr] 1

You might need to add your username to the dialout group:

sudo add [your Username] dialout

### connect HRM

You need to enable the Zephyr HRM to have it connected. A quick way is to rub to belt for a few seconds, and check if there is any data flow over. If you are view data flow from web page, please try to refresh it. 

Note: 
If HRM is not enabled, you might have "cannot open port..." error. 


### For other OSs

The Zephyr HRM might be discovered automatically in windows and MAC OSs. After pairing with the pin code "1234", Please change the "port" setting in config.json to match your settings. 
