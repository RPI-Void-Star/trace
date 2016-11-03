#! /usr/bin/python3
from enums import PinValue

class BlockDefaults:
    """Default values for Block initialization"""
    DEFAULT_PIN_VALUE = PinValue.low
    DEFAULT_PIN = 0
    

if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
