#! /usr/bin/python3

# sys.argv
import sys

# classes.Block
import classes

# json.load
import json

def load(blocks, index):
    returnVal = classes.Block()
    returnVal.id = index
    print(blocks[index])

    if 'next' in blocks[index]:
        print("Has next =", blocks[index]['next'])
        returnVal.next = blocks[index]['next']
    else:
        print("ERROR: Block", index, "missing 'next'")
        exit(1)

    if 'type' in blocks[index]:
        print("Has type =", blocks[index]['type'])
        returnVal.type = blocks[index]['type']
    else:
        print("ERROR: Block", index, "missing 'type'")
        exit(1)

    if 'attributes' in blocks[index]:
        print("Has attributes =", blocks[index]['attributes'])
        returnVal.attributes = blocks[index]['attributes']
    print("---")
    return returnVal

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("ERROR: Invalid number of arguments")
        print("Usage: ./main.py [input-file.json]")
        exit(1)
    if sys.argv[1] == "help" or sys.argv[1] == "--help" or sys.argv[1] == "-h":
        print("Usage: ./main.py [input-file.json]")
        exit(0)

    inputFile = open(sys.argv[1], 'r') # 'r' is the default permission, but explicit is better than implicit

    tmp = []
    jsonObj = json.load(inputFile)
    if 'blocks' not in jsonObj:
        print("ERROR: No 'blocks' object in", sys.argv[1])
        exit(1)
    else:
        for i in jsonObj['blocks']:
            tmp.append(load(jsonObj['blocks'], i))
