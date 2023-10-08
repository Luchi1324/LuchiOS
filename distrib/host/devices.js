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
                var params = new Array(event.which, event.shiftKey, event.ctrlKey);
                // Enqueue this interrupt on the kernel interrupt queue so that it gets to the Interrupt handler.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KEYBOARD_IRQ, params));
            }
        }
        static hostUpdateCpuDisplay(init) {
            // HTML Context
            const cpuDisplay = document.getElementById("tableCpu");
            let currentRow;
            // Removes previous row if the row is already initialized ...
            if (init !== true) {
                cpuDisplay.deleteRow(1);
            }
            // ... then updates current row based on the global _CPU's attributes
            let cpuAttr = [_CPU.PC, _CPU.instruReg, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting];
            currentRow = cpuDisplay.insertRow(1);
            for (let i = 0; i < cpuAttr.length; i++) {
                let cell = currentRow.insertCell();
                typeof cpuAttr[i] === 'number' ? cell.textContent = `${cpuAttr[i].toString(16).toUpperCase()}` : cell.textContent = `${cpuAttr[i].toString()}`;
            }
        }
        static hostUpdatePcbDisplay(pcb) {
            // HTML Context
            const pcbDisplay = document.getElementById("tablePcb");
            let currentRow;
            let pcbAttr = [TSOS.ProcessControlBlock.currentPID, pcb.pc, pcb.acc, pcb.XReg, pcb.YReg, pcb.ZFlag, pcb.state];
            // If the PCB being inserted is not a new one ...
            if (TSOS.ProcessControlBlock.currentPID === pcbAttr[0] && pcbAttr[6] != "New") {
                // ... then we remove the old one ...
                pcbDisplay.deleteRow(TSOS.ProcessControlBlock.currentPID + 1);
                // ... and insert the most recent version of the PCB
                currentRow = pcbDisplay.insertRow(TSOS.ProcessControlBlock.currentPID + 1);
                for (let i = 0; i < pcbAttr.length; i++) {
                    let cell = currentRow.insertCell();
                    typeof pcbAttr[i] === 'number' ? cell.textContent = `${pcbAttr[i].toString(16).toUpperCase()}` : cell.textContent = `${pcbAttr[i].toString()}`;
                }
                // ... else we just insert a newer row for the new PCB
            }
            else {
                currentRow = pcbDisplay.insertRow();
                for (let i = 0; i < pcbAttr.length; i++) {
                    let cell = currentRow.insertCell();
                    typeof pcbAttr[i] === 'number' ? cell.textContent = `${pcbAttr[i].toString(16).toUpperCase()}` : cell.textContent = `${pcbAttr[i].toString()}`;
                    ;
                }
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