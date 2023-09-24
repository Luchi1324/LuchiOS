/* ------------
     Devices.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and simulation scripts) is the only place that we should see "web" code, like
     DOM manipulation and TypeScript/JavaScript event handling, and so on.  (Index.html is the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Devices {
        constructor() {
            _hardwareClockID = -1;
        }
        //
        // Hardware/Host Clock Pulse
        //
        static hostClockPulse() {
            // Increment the hardware (host) clock.
            _OSclock++;
            // Call the kernel clock pulse event handler.
            _Kernel.krnOnCPUClockPulse();
        }
        //
        // Keyboard Interrupt, a HARDWARE Interrupt Request. (See pages 560-561 in our text book.)
        //
        static hostEnableKeyboardInterrupt() {
            // Listen for key press (keydown, actually) events in the Document
            // and call the simulation processor, which will in turn call the
            // OS interrupt handler.
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        }
        static hostDisableKeyboardInterrupt() {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        }
        static hostOnKeypress(event) {
            // The canvas element CAN receive focus if you give it a tab index, which we have.
            // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
            if (event.target.id === "display") {
                event.preventDefault();
                // Note the pressed key code in the params (Mozilla-specific).
                var params = new Array(event.which, event.shiftKey);
                // Enqueue this interrupt on the kernel interrupt queue so that it gets to the Interrupt handler.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KEYBOARD_IRQ, params));
            }
        }
        static hostUpdateCpuDisplay() {
            const cpuDisplay = document.getElementById("tableCpu");
            // Erases table to allow for new one, and generates headers
            cpuDisplay.innerHTML = "<tr><th>PC</th><th>Acc</th><th>X</th><th>Y</th><th>Z</th><th>isExecuting</th></tr>";
            let currentRow;
            let cpuAttr = [_CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting];
            currentRow = cpuDisplay.insertRow();
            // For loop from an array of the CPU's attributes
            // There is definitely a better solution, but this is the neatest I can think of so I don't type out 5 'let cell='s
            for (let i = 0; i < cpuAttr.length; i++) {
                let cell = currentRow.insertCell();
                cell.textContent = `${cpuAttr[i].toString()}`;
            }
        }
        static hostUpdateMemDisplay() {
            const memDisplay = document.getElementById("tableMemory");
            // Erases table to allow for new one
            memDisplay.innerHTML = "";
            let currentRow;
            _Memory.memArray.forEach((item, index) => {
                // Creates a new row for each item, and adds a heading row
                if (index % 8 === 0) {
                    //currentRow = memDisplay.insertRow();
                    currentRow = memDisplay.insertRow();
                    let cell = currentRow.insertCell();
                    cell.textContent = `0x${index.toString(16).toUpperCase()}`;
                }
                if (currentRow) {
                    const cell = currentRow.insertCell();
                    // Padding 0s
                    if (item <= 0x0F) {
                        cell.textContent = `0${item.toString(16).toUpperCase()}`;
                    }
                    else {
                        cell.textContent = item.toString(16).toUpperCase();
                    }
                }
            });
        }
    }
    TSOS.Devices = Devices;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=devices.js.map