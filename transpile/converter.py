#! /usr/bin/python3
from abc import ABCMeta, abstractmethod
from simplegeneric import generic
from blocks import *
import os

class Converter:
    '''The base class for converters that produce code for a given target'''
    __metaclass__ = ABCMeta
    
    def __init__(self, inputFile, outputFile):
        self._inputFile = inputFile
        self._outputFile = outputFile
    
    @abstractmethod
    def convert(self, startBlock):
        '''Converts a block structure to a program for the target, saving the code to the given file'''
        return
        

class ArduinoConverter(Converter):
    '''An implementation of Converter that targets the Arduino'''
    
    def convert(self, startBlock):
    
        program = ''
        program += ArduinoConverter.parse(startBlock)
        print(program)
        
        f = open(self._outputFile, 'w')
        f.write(program)
        f.close()
        
    @generic
    def parse(block):
        return ''
        
    @parse.when_type(Block)
    def parseBlock(block):
        return '' + ArduinoConverter.parse(block.next)

    @parse.when_type(StartBlock)
    def parseStartBlock(block):
        return ('int main()\n'
                '{{\n'
                'while (1)\n'
                '{{\n'
                '{0}\n'
                '}}\n'
                '}}\n').format(ArduinoConverter.parse(block.next))

    @parse.when_type(LoopBlock)
    def parseLoopBlock(block):
        return ('while ({0})\n'
                '{{\n'
                '{1}\n'
                '}}').format(block.condition, ArduinoConverter.parse(block.child)) + ArduinoConverter.parse(block.next)

    @parse.when_type(ConditionalBlock)
    def parseConditionalBlock(block):
        return ('if ({0})\n'
                '{{\n'
                '{1}\n'
                '}}\n'
                'else\n'
                '{{\n'
                '{2}\n'
                '}}').format(block.condition, ArduinoConverter.parse(block.ifTrue), ArduinoConverter.parse(block.ifFalse)) + ArduinoConverter.parse(block.next)


if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
