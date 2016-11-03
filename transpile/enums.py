#! /usr/bin/python3
from enum import Enum

class PinValue(Enum):
    """An enum that represents the logical states that a digital pin can be in"""
    low = 0
    high = 1


if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
