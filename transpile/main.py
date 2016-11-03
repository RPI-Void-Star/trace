#! /usr/bin/python3

# sys.argv
import sys

# blocks.Block
from blocks import *

# json.load
import json

def createBlock(blockDictionary, index):
    '''Creates a block with the default atributes from the loaded json dictionary corresponding to that block'''
    returnVal = None
    
    if 'type' in blockDictionary:
        if blockDictionary['type'] == 'start':
            returnVal = StartBlock(index)
        elif blockDictionary['type'] == 'loop':
            returnVal = LoopBlock(index)
        elif blockDictionary['type'] == 'conditional':
            returnVal = ConditionalBlock(index)
        elif blockDictionary['type'] == 'variable':
            returnVal = VariableBlock(index)
        else:
            print('ERROR: Unknown block type: ' + blocks[index]['type'])
            exit(1)
    else:
        print('ERROR: Block', index, 'missing "type"')
        exit(1)
    
    return returnVal
    
def loadBlockArray(blockDictionary):
    '''Creates blocks corresponding to those in the dictionary with their default atributes'''
    blockArray = [None] * len(blockDictionary)
    for index in range(0, len(blockDictionary)):
        curDict = blockDictionary[index]
        curBlock = createBlock(curDict, index)
        blockArray[index] = curBlock
    return blockArray

def populateAttributes(blockDictionary, blocks):
    '''Populates the attributes of the blocks from the dictionary'''
    for index in range(0, len(blockDictionary)):
        curDict = blockDictionary[index]
        curBlock = blocks[index]
        if 'next' in curDict:
            if not curDict['next'] is None:
                curBlock.next = blocks[int(curDict['next'])]
        else:
            print('ERROR: Block ' + index + ' missing next property')
            exit(1)
        if 'attributes' in curDict:
            attributes = curDict['attributes']
            for attribute in curDict['attributes']:
                if (attribute == 'child'):
                    childIndex = int(attributes['child'])
                    curBlock.child = blocks[childIndex]
                elif (attribute == 'children'):
                    if not 'true'  in attributes['children']:
                        print('ERROR: Conditional block' + index + ' missing true child')
                    if not 'false' in attributes['children']:
                        print('ERROR: Conditional block' + index + ' missing false child')
                    if not attributes['children']['true'] is None:
                        trueIndex  = int(attributes['children']['true'])
                        curBlock.ifTrue  = blocks[trueIndex]
                    if not attributes['children']['false'] is None:
                        falseIndex = int(attributes['children']['false'])
                        curBlock.ifFalse = blocks[falseIndex]
                else:
                    setattr(curBlock, attribute, curDict['attributes'][attribute])

def main_func(filename):
    inputFile = open(filename, 'r') # 'r' is the default permission, but explicit is better than implicit

    blockArray = None
    tmp = {}
    jsonObj = json.load(inputFile)
    if 'blocks' not in jsonObj:
        print('ERROR: No "blocks" object in', sys.argv[1])
        exit(1)
    else:
        blockDictionary = jsonObj['blocks']
        blockArray = loadBlockArray(blockDictionary)
        populateAttributes(blockDictionary, blockArray)

    startBlock = blockArray[0]
    print(startBlock.next)

    return startBlock

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('ERROR: Invalid number of arguments')
        print('Usage: ./main.py [input-file.json]')
        exit(1)
    if sys.argv[1] == 'help' or sys.argv[1] == '--help' or sys.argv[1] == '-h':
        print('Usage: ./main.py [input-file.json]')
        exit(0)

    startBlock = main_func(sys.argv[1])
