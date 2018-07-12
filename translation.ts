import GrovePi from './GrovePi';

//var Commands = GrovePi.commands
//var Board = GrovePi.board
//var AccelerationI2cSensor = GrovePi.sensors.AccelerationI2C
var UltrasonicDigitalSensor = GrovePi.sensors.UltrasonicDigital
//var AirQualityAnalogSensor = GrovePi.sensors.AirQualityAnalog
//var DHTDigitalSensor = GrovePi.sensors.DHTDigital
//var LightAnalogSensor = GrovePi.sensors.LightAnalog
var DigitalButtonSensor = GrovePi.sensors.DigitalButton
//var LoudnessAnalogSensor = GrovePi.sensors.LoudnessAnalog
var RotaryAngleAnalogSensor = GrovePi.sensors.RotaryAnalog
//var DustDigitalSensor = GrovePi.sensors.dustDigital
//var DigitalOutput = GrovePi.sensors.DigitalOutput
var MoistureSensor = GrovePi.sensors.MoistureSensor
var LED = GrovePi.sensors.LED 
var Buzzer = GrovePi.sensors.Buzzer
var Sound = GrovePi.sensor.Sound

namespace grove {

    enum PortType {
        LED,
        Ultrasonic,
        Button,
        Rotary,
        Buzzer,
        Moisture,
        Sound
    }

    interface StoredPort {
        type : PortType,
        sensor : any,
    }

    var _configuredPorts : { [k : number] : StoredPort };

    var _board : GrovePi.board | undefined;

    const _typeToConstructor : Map<PortType, (number) => any> = new Map([
        [PortType.LED, (port) => new LED(port)],
        [PortType.Ultrasonic, (port) => new UltrasonicDigitalSensor(port)],
        [PortType.Button, (port) => new DigitalButtonSensor(port)],
        [PortType.Rotary, (port) => new RotaryAngleAnalogSensor(port)],
        [PortType.Moisture, (port) => new MoistureSensor(port)],
        [PortType.Buzzer, (port) => new Buzzer(port)],
        [PortType.Sound, (port) => new Sound(port)]
    ]);

    export function initialize() : void {
        _board = new GrovePi.board({
            onError : (msg) =>  {
                console.log("Board failed to initialize: ", msg);
            },
            onInit : () => {
                console.log("GrovePi board initialized!");
            }
        });
        _board.init();

        _configuredPorts = {};
    }

    function createOrGetSensor(port : number, type : PortType) : GrovePi.base.sensor {
        var storedPort = _configuredPorts[port];
        if (storedPort == undefined) {
            let ctor = _typeToConstructor.get(type);
            let sensorObject = ctor ? ctor(port) : undefined;
            if (sensorObject == undefined) {
                throw Error("Could not get ctor for type: " + type);
            }
            _configuredPorts[port] = {
                type: type,
                sensor: sensorObject
            };
            return sensorObject;
        } else if (storedPort.type != type) {
            throw Error("Sensor type mismatch: was " + storedPort.type + ", expected " + type);
        }
        return storedPort.sensor;
    }

    // Led
    export function ledOn(port : number) {
        const led = createOrGetSensor(port, PortType.LED);
        led.turnOn();
    }

    export function ledOff(port : number) {
        const led = createOrGetSensor(port, PortType.LED);
        led.turnOff();
    }

    // Ultrasonic Ranger
    export function pollUltrasonicRanger(port : number) {
        const ultrasonicSensor = createOrGetSensor(port, PortType.Ultrasonic)

        ultrasonicSensor.on('change', function (_res : any) {
            // Do on Change
            console.log("Ultrasonic ranger value changed")
        })
        ultrasonicSensor.watch()
    }

    // Button
    export function pollButtonPress(port : number) {
        const buttonSensor = createOrGetSensor(port, PortType.Button)

        buttonSensor.on('down', function (res : string) {
            if(res == 'longpress') {
                console.log("Longpress")
            }
            else {
                console.log("Shortpress")
            }
        })
        buttonSensor.watch()
    }

    // Rotary Angle
    export function pollRotaryAngle(port : number) {
        const rotaryAngleSensor = createOrGetSensor(port, PortType.Rotary);
        
        rotaryAngleSensor.start()
        rotaryAngleSensor.on('data', function (_res : any) {
            // Do on Change
            console.log("Rotary value changed" + _res)
        })
    }

    export function getRotaryAngleValue(port : number) {
        const rotaryAngleSensor = createOrGetSensor(port, PortType.Rotary);
        
        return rotaryAngleSensor.read()
    }

    // Moisture Sensor
    export function getMoistureValue(port : number) {
        const moistureSensor = createOrGetSensor(port, PortType.Moisture);

        return moistureSensor.read()
    }

    // Buzzer
    export function buzzerOn(port : number) {
        const buzzer = createOrGetSensor(port, PortType.Buzzer)
        buzzer.turnOn()
    }

    export function buzzerOff(port: number) {
        const buzzer = createOrGetSensor(port, PortType.Buzzer)
        buzzer.turnOff()
    }

    // Sound

    export function getSoundSensorValue(port : number) {
        const sound = createOrGetSensor(port, PortType.Sound)
        return sound.read()
    }
}

export default grove;