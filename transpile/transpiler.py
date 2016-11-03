import converter

class Transpiler():
    '''The class that handles file loading and compilation/uploading'''
    def __init__(self, inputFile, port)
        self._inputFile = inputFile
        self._cFile = ''      # TODO generate this name 
        self._binaryFile = '' # TODO generate this name
        self._port = port
        self._rootBlock = None
        self._converter = ArduinoConverter(self._inputFile, self._cFile)
    
    def transpile():
        '''Transpiles the given input file, uploading it via avrdude to the given port'''
        __load()
        __convert()
        __compile()
        __upload()
        # TODO return an error if any are encountered
    
    def __upload():
        '''Uploads the binary file to the Arduino on the given port with avrdude'''
        # TODO call avrdude with the appropriate flags
    
    def __compile():
        '''Compiles the given Arduino C file to a binary file using avr-g++'''
        # TODO call avr-g++ with the appropriate flags
    
    def __convert():
        '''Converts the user's block diagram to C code using the appropriate Converter'''
        converter.convert(inputFile, cFile)
    
    def __load():
        '''Loads the input file and saves the root block'''
        # TODO move Greg's code here


if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
