#! /usr/bin/python3
from abc import ABCMeta

class Block(metaclass=ABCMeta):
    def __init__(self):
        self._id = -1
        self._next = -1
        self._type = "null"
        self._attributes = {}

class LoopBlock(Block):
    def __init__(self):
        self._type = "loop"

class ConditionalBlock(Block):
    def __init__(self):
        self._type = "conditional"
        self._condition = "null"
        self._ifTrue = "null"
        self._ifFalse = "null"

class VariableBlock(Block):
    def __init__(self):
        self._type = "variable"

if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
