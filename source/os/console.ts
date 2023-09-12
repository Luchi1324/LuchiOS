/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public cmdHistory = [],
                    public cmdNo = 0) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and add the command to our commandHistory, increase commandNo and reset our buffer.
                    this.cmdHistory.push(this.buffer);
                    this.cmdNo++;
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { // the Backspace key
                    this.removeText();
                } else if (chr === "up") { // The up arrow key
                    // Removes line, gets the command from the commandHistory and inserts it into the buffer
                    if (this.cmdNo !== 0) {
                        this.removeLine();
                        this.putText(this.cmdHistory[this.cmdNo]);
                        this.buffer = this.cmdHistory[this.cmdNo];
                        this.cmdNo--;
                    }
                } else if (chr === "down") { // The down arrow key
                    // Same as upkey, but in opposite direction
                    if (this.cmdNo !== this.cmdHistory.length - 1) {
                        this.removeLine();
                        this.putText(this.cmdHistory[this.cmdNo]);
                        this.buffer = this.cmdHistory[this.cmdNo];
                        this.cmdNo++;
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
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
                    let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, ch)
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, ch);
                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }

        public removeText(): void {
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

         public removeLine(): void {
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

        public advanceLine(): void {
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
                let offset = this.currentYPosition - _Canvas.height + _FontHeightMargin
                let screenData = _DrawingContext.getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
                // ... then clears the screen and redraws the canvas
                this.clearScreen();
                _DrawingContext.putImageData(screenData, 0, -offset);
                this.currentYPosition -= offset;
            }
        }
    }
 }
