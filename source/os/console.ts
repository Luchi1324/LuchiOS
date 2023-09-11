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
                    public buffer = "") {
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
                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { // the Backspace key
                    this.removeText();
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
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
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
            _DrawingContext.clearRect(xBeginnningPos, yBeginningPos, xSet, ySet);
            this.currentXPosition = xBeginnningPos;
            this.buffer = this.buffer.slice(0, -1);
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
                // Calculates offset from current position and captures the current canvas ...
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
