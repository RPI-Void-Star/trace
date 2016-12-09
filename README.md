# trace
A visual programming language for Arduino-like platforms.

[![Build Status](https://travis-ci.org/RPI-Void-Star/trace.svg?branch=master)](https://travis-ci.org/RPI-Void-Star/trace)

Trace is a visual programming environment for the Arduino platform. It allows you to construct programs (aka traces) composed of blocks. These traces then be transpiled and uploaded to a connected Arduino.

Congratulations on your latest download of the Trace runtime. You have begun your journey into embedded development. This guide will serve as a summary of basic features and UI navigation. Enjoy!

# Interface Overview

## Blocks
The most basic component of any trace is the block. They contain three parts, a Title Bar that contains the block’s name, a gray Body, and a white footer. Blocks represent various snippets of code and can be connected together to form programs. All traces contain a start block that represents the start of your program.

## Canvas
The canvas holds all blocks of your program and renders a faint grid to assist in block alignment.

## Configuration Bar
The left side bar can be used to adjust various attributes of placed blocks.

## Template Block Panel
The right side bar holds various “template” blocks that can then be dragged onto the canvas.

## Menu Toolbar
Features options to save or load projects as well as configure the Serial connection used to program an attached Arduino.

# Common Tasks

## Adding Blocks
To add a block to your trace find the corresponding block in the Template Block Panel. Click and without releasing the mouse, drag the template onto the Canvas. Release the mouse and a matching block will be added to your trace.

## Remove Blocks
With a block selected press the Backspace button to remove a block. If the block is part of a chain, the chain will be adjusted so that the deleted block’s parent will now point to the deleted block’s child.

## Configure Blocks
To configure a block that is in the Canvas first click on it. If the Configuration Bar is closed open it be pressing the Three Bar button in the top left. The Configuration Bar will open and update with the current attributes of the block. Adjust the attributes as desired and hit Tab to see the changes update in the Canvas.

## Move Blocks
To move a block you must first select it by clicking on it, and then Click and Drag the blocks white Title Bar. The cursor will update to a move icon when you are hovering over the Title Bar.

## Add a Connection
To add a link between two blocks you must first select the “source” block by clicking on it. Now press the Left Mouse button while over the “source” block’s Body. With the mouse button still pressed, press and release the “c” button and drag the mouse over to the “destination” block’s Body. Release the mouse button and a new connection will be formed.

## Remove a Connection
To remove a connection between two blocks select the “source” block and then press and release the “d” key.

## Upload
To upload a program to your device you must first set the proper serial port in the “Port” option found in the Toolbar. If you leave this field blank the program will still transpile but will not be uploaded. A program must be saved before it can be transpiled. Once you click the Transpile button the transpilation process begins. It may take up to 15 seconds before the “Upload Successful” message appears.

## Serial Monitor
Trace also features the ability to read from the Serial output of an Arduino to improve program debugging. To use this feature you must first set the proper serial port for your Arduino in the “Port” option found in the Toolbar. Next press the “Monitor” button found in the toolbar. The Serial Monitor Pane will appear and will update with new serial data as it arrives.
