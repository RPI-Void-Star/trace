#! /usr/bin/python3

import serial
import sys


class COMportReader():
    def __init__(self):
        ser = serial.Serial()


def printUsage():
    print('Usage: ./com_test.py [COM port #]')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('ERROR: Invalid number of arguments')
        printUsage()
        exit(1)

    if sys.argv[1] == 'help' or sys.argv[1] == '--help' or sys.argv[1] == '-h':
        printUsage()
        exit(0)

    if len(sys.argv) > 1:
        testCOMPort = COMportReader()
        testCOMPort.ser = serial.Serial(sys.argv[1], 9600, timeout=1)
        while(True):
            to_stdout = testCOMPort.ser.read(4096)
            if to_stdout:
                print(to_stdout)
