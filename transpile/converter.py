from abc import ABCMeta

class Converter:
    '''The base class for converters that produce code for a given target'''
    __metaclass__ = ABCMeta
    
    def __init__(self, inputFile, outputFile)
        self._inputFile = inputFile
        self._outputFile = outputFile
    
    @abc.abstractmethod
    def convert()
        '''Converts a block structure to a program for the target, saving the code to the given file'''
        

class ArduinoConverter(Converter):
    '''An implementation of Converter that targets the Arduino'''
    
    def convert(startBlock)
        # TODO implement this


if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
