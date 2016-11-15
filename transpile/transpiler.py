#! /usr/bin/python3
from converter import Converter, ArduinoConverter
import os
import subprocess

# blocks.Block
from blocks import *

# json.load
import json


class Transpiler():
    """The class that handles file loading and compilation/uploading"""
    def __init__(self, inputFile, port):
        self._inputFile = inputFile
        self._cFile = 'test.c'         # TODO generate this name
        self._binaryFile = 'test.hex'  # TODO generate this name
        self._port = port
        self._rootBlock = None
        self._converter = ArduinoConverter(self._inputFile, self._cFile)

    def transpile(self):
        """Transpiles the given input file, uploading it via avrdude to the given port"""
        self.__load()
        self.__convert()
        self.__compile()
        # self.__upload()
        # TODO return an error if any are encountered

    def __upload(self):
        """Uploads the binary file to the Arduino on the given port with avrdude"""
        # Execute avrdude to upload the Intel hex file to the Arduino
        subprocess.call('avrdude -p m328p -P {0} -c arduino -b 19200 -F -u -U flash:w:{1}'
                        .format(self._port, self._binaryFile))

    def __compile(self):
        """Compiles the given Arduino C file to a binary file using avr-g++"""
        # Compile c file into a temporary object file
        subprocess.call('avr-g++ {0} -mmcu=atmega328p -c -o temp.o -Os'.format(self._cFile,
                                                                               self._binaryFile))
        # Copy object file into Intel hex binary file
        subprocess.call('avr-objcopy -R .eeprom -O ihex temp.o {0}'.format(self._binaryFile))
        # Remove the temporary object file
        try:
            os.remove("temp.o")
        except OSError:
            pass

    def __convert(self):
        """Converts the user's block diagram to C code using the appropriate Converter"""
        self._converter.convert(self._rootBlock)

    def __load(self):
        """Loads the input file and saves the root block"""
        self._rootBlock = load(self._inputFile)


def createBlock(blockDictionary, index):
    """
    Creates a block with the default atributes from the loaded json dictionary corresponding to that
    block
    """
    returnVal = None

    if 'type' in blockDictionary:
        if blockDictionary['type'] == 'start':
            returnVal = StartBlock(index)
        elif blockDictionary['type'] == 'loop':
            returnVal = LoopBlock(index)
        elif blockDictionary['type'] == 'conditional':
            returnVal = ConditionalBlock(index)
        elif blockDictionary['type'] == 'variable':
            returnVal = VariableBlock(index)
        else:
            print('ERROR: Unknown block type: ' + blocks[index]['type'])
            exit(1)
    else:
        print('ERROR: Block', index, 'missing "type"')
        exit(1)

    return returnVal


def loadBlockArray(blockDictionary):
    """Creates blocks corresponding to those in the dictionary with their default atributes"""
    blockArray = [None] * len(blockDictionary)
    for index in range(0, len(blockDictionary)):
        curDict = blockDictionary[index]
        curBlock = createBlock(curDict, index)
        blockArray[index] = curBlock
    return blockArray


def populateAttributes(blockDictionary, blocks):
    """Populates the attributes of the blocks from the dictionary"""
    for index in range(0, len(blockDictionary)):
        curDict = blockDictionary[index]
        curBlock = blocks[index]
        if 'next' in curDict:
            if not curDict['next'] is None:
                curBlock.next = blocks[int(curDict['next'])]
        else:
            print('ERROR: Block ' + index + ' missing next property')
            exit(1)
        if 'attributes' in curDict:
            attributes = curDict['attributes']
            for attribute in curDict['attributes']:
                if (attribute == 'child'):
                    childIndex = int(attributes['child'])
                    curBlock.child = blocks[childIndex]
                elif (attribute == 'children'):
                    if 'true' not in attributes['children']:
                        print('ERROR: Conditional block' + index + ' missing true child')
                    if 'false' not in attributes['children']:
                        print('ERROR: Conditional block' + index + ' missing false child')
                    if not attributes['children']['true'] is None:
                        trueIndex = int(attributes['children']['true'])
                        curBlock.ifTrue = blocks[trueIndex]
                    if not attributes['children']['false'] is None:
                        falseIndex = int(attributes['children']['false'])
                        curBlock.ifFalse = blocks[falseIndex]
                else:
                    setattr(curBlock, attribute, curDict['attributes'][attribute])


def load(filename):
    # 'r' is the default permission, but explicit is better than implicit
    inputFile = open(filename, 'r')

    blockArray = None
    tmp = {}
    jsonObj = json.load(inputFile)
    if 'blocks' not in jsonObj:
        print('ERROR: No "blocks" object in', sys.argv[1])
        exit(1)
    else:
        blockDictionary = jsonObj['blocks']
        blockArray = loadBlockArray(blockDictionary)
        populateAttributes(blockDictionary, blockArray)

    startBlock = blockArray[0]

    return startBlock

if __name__ == '__main__':
    print('WARNING: This file is not meant to stand alone. Run main.py instead.')
    exit(1)
