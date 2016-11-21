#! /usr/bin/python3
from abc import ABCMeta, abstractmethod
from simplegeneric import generic
from blocks import *
import os


class Converter:
    """The base class for converters that produce code for a given target"""
    __metaclass__ = ABCMeta

    def __init__(self, inputFile, outputFile):
        self._inputFile = inputFile
        self._outputFile = outputFile

    @abstractmethod
    def convert(self, startBlock):
        """
        Converts a block structure to a program for the target, saving the code to the given file
        """
        return


class ArduinoConverter(Converter):
    """An implementation of Converter that targets the Arduino"""

    def convert(self, startBlock):

        program = '#include <Arduino.h>\n\n'
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
    return (space + 'void setup() {{}}\n' +
            space + '\n' +
            space + 'void loop()\n' +
            space + '{{\n' +
            '{0}' +
            space + '}}\n').format(parse(block.next, space + '  '))


@parse.when_type(LoopBlock)
def parseLoopBlock(block, space):
    return (space + 'while ({0})\n' +
            space + '{{\n' +
                    '{1}' +
            space + '}}\n').format(
                block.condition,
                parse(block.child, space + '  ')) + parse(block.next, space + '  ')


@parse.when_type(ConditionalBlock)
def parseConditionalBlock(block, space):
    return (space + 'if ({0})\n' +
            space + '{{\n' +
            '{1}' +
            space + '}}\n' +
            space + 'else\n' +
            space + '{{\n' +
            '{2}' +
            space + '}}\n').format(
                block.condition,
                parse(block.ifTrue, space + '  '),
                parse(block.ifFalse, space + '  ')) + parse(block.next, space + '  ')


@parse.when_type(WriteBlock)
def parseWriteBlock(block, space):
    return (space + 'digitalWrite({0},{1});\n' +
                    '{2}').format(block.pin, block.value, parse(block.next, space))


@parse.when_type(ReadBlock)
def parseReadBlock(block, space):
    return (space + '{1} = digitalRead({0});\n' +
                    '{2}').format(block.pin, block.var, parse(block.next, space))


@parse.when_type(SleepBlock)
def parseSleepBlock(block, space):
    return (space + 'delay({0});\n' +
                    '{1}').format(block.length, parse(block.next, space))


@parse.when_type(CodeBlock)
def parseCodeBlock(block, space):
    return (space + block.code + ';\n' +
                    '{0}').format(parse(block.next, space))


@parse.when_type(VariableBlock)
def parseVariableBlock(block, space):
    return (space + 'int {0} = 0;\n' +
                    '{1}').format(block.name, parse(block.next, space))


if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
