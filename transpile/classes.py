#! /usr/bin/python3

class Block:
    id = -1
    next = -1
    type = "null"
    attributes = {}

class LoopBlock(Block):
    type = "loop"

class ConditionalBlock(Block):
    type = "conditional"
    condition = "null"
    ifTrue = "null"
    ifFalse = "null"

class VariableBlock(Block):
    type = "variable"

if __name__ == "__main__":
    print("WARNING: This file is not meant to stand alone. Run main.py instead.")
    exit(1)
