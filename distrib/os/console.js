/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        currentFont;
        currentFontSize;
        currentXPosition;
        currentYPosition;
        buffer;
        upStack;
        downStack;
        currentCommand;
        cmdNo;
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", upStack = [], downStack = [], currentCommand = "", cmdNo = 0) {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.upStack = upStack;
            this.downStack = downStack;
            this.currentCommand = currentCommand;
            this.cmdNo = cmdNo;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and then insert the command into our up stack (think like it's storing the command 'in' the up key), then clear the buffer
                    this.upStack.push(this.buffer);
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { // the Backspace key
                    this.removeText();
                }
                else if (chr === "up") { // The up arrow key
                    // If we have commands in the up stack ...
                    if (this.upStack.length > 0) {
                        // ... note the current command as the last entered one, and move it to the down stack ...
                        this.currentCommand = this.upStack.pop();
                        this.downStack.push(this.currentCommand);
                        // ... remove the line, and empty the buffer ...
                        this.removeLine();
                        this.buffer = "";
                        // ... then we print the current command, set the buffer, and then set it to nothing again
                        _StdOut.putText(this.currentCommand);
                        this.buffer = this.currentCommand;
                        this.currentCommand = "";
                    }
                }
                else if (chr === "down") { // The down arrow key
                    // Same method as the up key, but I don't want to write the same thing again
                    if (this.downStack.length > 0) {
                        this.currentCommand = this.downStack.pop();
                        this.upStack.push(this.currentCommand);
                        this.removeLine();
                        this.buffer = "";
                        _StdOut.putText(this.currentCommand);
                        this.buffer = this.currentCommand;
                        this.currentCommand = "";
                    }
                }
                else if (chr === "tab") { // The tab key
                    // Stores the current user input so we can check if it matches any commands in the OS
                    let previousBuffer = this.buffer;
                    let tabResults = this.getTabCmd(previousBuffer);
                    // If we have just one result ...
                    if (tabResults.length === 1) {
                        // ... we just insert it in place of the current line ...
                        this.removeLine();
                        this.buffer = tabResults[0];
                        _StdOut.putText(tabResults[0]);
                    }
                    else if (tabResults.length > 1) {
                        // ... or we just print out a list of the possible commands the user can enter
                        // kinda like the cisco iOS
                        this.advanceLine();
                        _StdOut.putText(tabResults.join(' '));
                        this.advanceLine();
                        _OsShell.putPrompt();
                        _StdOut.putText(this.buffer);
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }
        putText(text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // In order to get line wrap, we need to draw the text character by character for it to work
                // So I changed the function to do it character by character instead of the entire text at once
                // I probably could do it with the text all at once, but I'm already pushing the deadline as is.
                for (let i = 0; i < text.length; i++) {
                    // If we're at the edge already, then we just advance the line
                    if (this.currentXPosition > _Canvas.width - 10) {
                        this.advanceLine();
                    }
                    // ... then we start drawing the text
                    let ch = text.charAt(i);
                    let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, ch);
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, ch);
                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
        }
        removeText() {
            // Calculate the size of the current character ...
            var xSet = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(this.buffer.length - 1));
            var ySet = _DefaultFontSize;
            // ... then find the beginning of the character to find the area to delete ...
            var xBeginnningPos = this.currentXPosition - xSet;
            var yBeginningPos = this.currentYPosition - ySet;
            // ... then we clear the canvas in the area, set the cursor back to the start, and remove the character from the buffer
            _DrawingContext.clearRect(xBeginnningPos, yBeginningPos, xSet, ySet + 3);
            this.currentXPosition = xBeginnningPos;
            this.buffer = this.buffer.slice(0, -1);
        }
        removeLine() {
            // Calculate the size of the current line ...
            var xSet = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            var ySet = _DefaultFontSize;
            // ... then find the beginning of the character to find the area to delete ...
            var xBeginnningPos = this.currentXPosition - xSet;
            var yBeginningPos = this.currentYPosition - ySet;
            // ... then we clear the canvas in the area, set the cursor back to the start, and remove the entire line from the buffer
            _DrawingContext.clearRect(xBeginnningPos, yBeginningPos, xSet, ySet + 3);
            this.currentXPosition = xBeginnningPos;
            this.buffer = "";
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // Fixes scrolling, only does so if current Y Position surpasses height
            if (this.currentYPosition > _Canvas.height) {
                // Calculates offset from current position () and captures the current canvas ...
                let offset = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                let screenData = _DrawingContext.getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
                // ... then clears the screen and redraws the canvas
                this.clearScreen();
                _DrawingContext.putImageData(screenData, 0, -offset);
                this.currentYPosition -= offset;
            }
        }
        getTabCmd(cmdStr) {
            let cmds = [];
            // We iterate through the shell's stored commands ...
            for (let i = 0; i < _OsShell.commandList.length; i++) {
                // ... if the passed string matches any of the stored commands ...
                if (_OsShell.commandList[i].command.indexOf(cmdStr) !== -1) {
                    // ... we add the matched command to a list of strings ...
                    cmds.push(_OsShell.commandList[i].command);
                }
            }
            // ... then we return the list of commands we found
            return cmds;
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map