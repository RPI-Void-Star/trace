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
        program += parse(startBlock, '')
        
        f = open(self._outputFile, 'w')
        f.write(program)
        f.close()
        
@generic
def parse(block, space):
	return ''
	
@parse.when_type(Block)
def parseBlock(block, space):
	return '' + parse(block.next, space + '  ')

@parse.when_type(StartBlock)
def parseStartBlock(block, space):
	return (space + 'int main()\n' +
			space + '{{\n' +
			space + '  while (1)\n' +
			space + '  {{\n' +
			'{0}\n' +
			space + '  }}\n' +
			space + '}}\n').format(parse(block.next, space + '    '))

@parse.when_type(LoopBlock)
def parseLoopBlock(block, space):
	return (space + 'while ({0})\n' +
			space + '{{\n' +
			        '{1}\n' +
			space + '}}').format(
				block.condition,
				parse(block.child, space + '  ')) + parse(block.next, space + '  ')

@parse.when_type(ConditionalBlock)
def parseConditionalBlock(block, space):
	return (space + 'if ({0})\n' +
			space + '{{\n' +
			'{1}\n' +
			space + '}}\n' +
			space + 'else\n' +
			space + '{{\n' +
			'{2}\n' +
			space + '}}').format(
				block.condition,
				parse(block.ifTrue, space + '  '),
				parse(block.ifFalse, space + '  ')) + parse(block.next, space + '  ')


if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
