#! /usr/bin/python3

# sys.argv
import sys

# blocks.Block
from blocks import *

# json.load
import json

def load(blocks, index):
    loop = False
    conditional = False
    variable = False
    start = False

    # Check type
    if 'type' in blocks[index]:
        if blocks[index]['type'] == 'start':
            start = True
            returnVal = StartBlock(index)
        elif blocks[index]['type'] == 'loop':
            loop = True
            returnVal = LoopBlock(index)
        elif blocks[index]['type'] == 'conditional':
            conditional = True
            returnVal = ConditionalBlock(index)
        elif blocks[index]['type'] == 'variable':
            variable = True
            returnVal = VariableBlock(index)
        else:
            print("ERROR: Unknown block type: " + blocks[index]['type'])
            exit(1)
    else:
        print("ERROR: Block", index, "missing 'type'")
        exit(1)

    # Check next
    if 'next' in blocks[index]:
        returnVal.next = blocks[index]['next']
    else:
        print("ERROR: Block", index, "missing 'next'")
        exit(1)

    # Check attributes
    if 'attributes' in blocks[index]:
        returnVal.attributes = blocks[index]['attributes']
        if conditional == True:
            if 'condition' in blocks[index]['attributes']:
                returnVal.condition = blocks[index]['attributes']['condition']
            else:
                print("ERROR: Conditional block", index, "missing attribute 'condition'")
                print("Conditional blocks require attributes: 'condition', 'children: true', 'children: false'")
                exit(1)

            if 'children' in blocks[index]['attributes']:
                if 'true' in blocks[index]['attributes']['children']:
                    returnVal.true = blocks[index]['attributes']['children']['true']
                else:
                    print("ERROR: Conditional block", index, "missing attribute: 'true'")
                    print("Conditional blocks require attributes: 'condition', 'children: true', 'children: false'")
                    exit(1)

                if 'false' in blocks[index]['attributes']['children']:
                    returnVal.false = blocks[index]['attributes']['children']['false']
                else:
                    print("ERROR: Conditional block", index, "missing attribute: 'false'")
                    print("Conditional blocks require attributes: 'condition', 'children: true', 'children: false'")
                    exit(1)
            else:
                print("ERROR: Conditional block", index, "missing attributes: 'children: true', 'children: false'")
                print("Conditional blocks require attributes: 'condition', 'children: true', 'children: false'")
                exit(1)

    elif conditional == True:
        print("ERROR: Block", index, "missing 'attributes'")
        print("Conditional blocks require attributes: 'condition', 'children: true', 'children: false'")
        exit(1)

    return returnVal

def main_func(filename):
    inputFile = open(filename, 'r') # 'r' is the default permission, but explicit is better than implicit

    tmp = {}
    jsonObj = json.load(inputFile)
    if 'blocks' not in jsonObj:
        print("ERROR: No 'blocks' object in", sys.argv[1])
        exit(1)
    else:
        for i in jsonObj['blocks']:
            tmp[int(i)] = load(jsonObj['blocks'], i)

    print(tmp)
    startBlock = tmp[0]
    current = startBlock
    while type(current.next) is int:
        current.next = tmp[current.next]
        current = current.next

    return startBlock

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("ERROR: Invalid number of arguments")
        print("Usage: ./main.py [input-file.json]")
        exit(1)
    if sys.argv[1] == "help" or sys.argv[1] == "--help" or sys.argv[1] == "-h":
        print("Usage: ./main.py [input-file.json]")
        exit(0)

    startBlock = main_func(sys.argv[1])
