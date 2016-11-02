#! /usr/bin/python3
from abc import ABCMeta
from enums import PinValue
from defaults import BlockDefaults

class Block:
    """An abstract class that represents a block in the user's code diagram"""
    __metaclass__ = ABCMeta
    def __init__(self, id):
        self._type = None
        self.id = id
        self.next = None
        self.attributes = {}

    @property
    def type(self):
        """Returns the type of this block"""
        return self._type

class LoopBlock(Block):
    """A block that represents a conditional loop in the user's code"""
    def __init__(self, id):
        super().__init__(id)
        self._type = "loop"
        self.id = None
        self.child = None

class ConditionalBlock(Block):
    """A block that represents a conditional branch in the user's code"""
    def __init__(self, id):
        super().__init__(id)
        self._type = "conditional"
        self.condition = None
        self.ifTrue = None
        self.ifFalse = None

class ReadBlock(Block):
    """A block that reads the value of a pin into a variable"""
    def __init__(self, id):
        super().__init__(id)
        self._type = "read"
        self.variable = None
        self.pin = BlockDefaults.DEFAULT_PIN_VALUE

class WriteBlock(Block):
    """A block that writes a value to a digital pin"""
    def __init__(self, id):
        super().__init__(id)
        self._type = "write"
        self.value = BlockDefaults.DEFAULT_PIN_VALUE
        self.pin = BlockDefaults.DEFAULT_PIN
        

if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
