#! /usr/bin/python3

# sys.argv
import sys

from transpiler import Transpiler

def printUsage():
    print('Usage: ./main.py [input-file.json] [port]')    

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('ERROR: Invalid number of arguments')
        printUsage()
        exit(1)
    if sys.argv[1] == 'help' or sys.argv[1] == '--help' or sys.argv[1] == '-h':
        printUsage()
        exit(0)
        
    transpiler = Transpiler(sys.argv[1], sys.argv[2])
    transpiler.transpile()