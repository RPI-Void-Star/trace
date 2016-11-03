#! /usr/bin/python3
from converter import Converter, ArduinoConverter
import os
import subprocess
import main

class Transpiler():
    '''The class that handles file loading and compilation/uploading'''
    def __init__(self, inputFile, port):
        self._inputFile  = inputFile
        self._cFile      = 'test.c'   # TODO generate this name 
        self._binaryFile = 'test.hex' # TODO generate this name
        self._port       = port
        self._rootBlock  = None
        self._converter  = ArduinoConverter(self._inputFile, self._cFile)
    
    def transpile(self):
        '''Transpiles the given input file, uploading it via avrdude to the given port'''
        self.__load()
        self.__convert()
        #self.__compile()
        #self.__upload()
        # TODO return an error if any are encountered
    
    def __upload(self):
        '''Uploads the binary file to the Arduino on the given port with avrdude'''
        # Execute avrdude to upload the Intel hex file to the Arduino
        subprocess.call('avrdude -p m328p -P {0} -c arduino -b 19200 -F -u -U flash:w:{1}'.format(self._port, self._binaryFile))
    
    def __compile(self):
        '''Compiles the given Arduino C file to a binary file using avr-g++'''
        # Compile c file into a temporary object file
        subprocess.call('avr-g++ {0} -mmcu=atmega328p -c -o temp.o -Os'.format(self._cFile, self._binaryFile))
        # Copy object file into Intel hex binary file
        subprocess.call('avr-objcopy -R .eeprom -O ihex temp.o {0}'.format(self._binaryFile))
        # Remove the temporary object file
        try:
            os.remove("temp.o")
        except OSError:
            pass
    
    def __convert(self):
        '''Converts the user's block diagram to C code using the appropriate Converter'''
        self._converter.convert(self._rootBlock)
    
    def __load(self):
        '''Loads the input file and saves the root block'''
        self._rootBlock = main.main_func(self._inputFile)


transpiler = Transpiler('../test/input/example.json', 'COM3')
transpiler.transpile()
        
#if __name__ == '__main__':
#    print('WARNING: This file is not meant to stand alone. Run main.py instead.')
#    exit(1)
