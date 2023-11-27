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
            const pcbDisplay = document.getElementById("tableProcess");
            let currentRow;
            let pcbAttr = [pcb.pid, pcb.pc, pcb.acc, pcb.XReg, pcb.YReg, pcb.ZFlag, pcb.state];
            // If the PCB being inserted is not a new one ...
            if (pcbAttr[6] != "New") {
                // ... then we remove the old one ...
                pcbDisplay.deleteRow(pcb.pid + 1);
                // ... and insert the most recent version of the PCB
                currentRow = pcbDisplay.insertRow(pcb.pid + 1);
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
        static highlightMemCell(row, addr, adjacent) {
            let cells = row.getElementsByTagName('td');
            if (adjacent !== undefined) {
                for (let i = 0; i < cells.length; i++) {
                    let cell = cells[i];
                    cell.classList.remove('highlight', adjacent); // Remove highlight class from all cells
                }
            }
            if (addr >= 0x00 && addr < cells.length) {
                let currentCell = cells[addr];
                currentCell.classList.add('highlight', adjacent); // Add highlight class to the current cell
            }
        }
        static hostUpdateMemDisplay(access, addr) {
            const memDisplay = document.getElementById("tableMemory");
            // Erases table to allow for new one
            memDisplay.innerHTML = "";
            let currentRow;
            _Memory.memArray.forEach((item, index) => {
                // Creates a new row for each item, and adds a heading row
                // I created this on my own originally, but I used ChatGPT to 'enhance' it by adding the 'th' element for the header rows.
                if (index % 8 === 0) {
                    currentRow = document.createElement('tr'); // Create a new table row
                    const cell = document.createElement('th'); // Create a table header cell for the index
                    cell.textContent = `0x${index.toString(16).toUpperCase()}`;
                    currentRow.appendChild(cell);
                    memDisplay.appendChild(currentRow); // Append the heading row to the table
                }
                if (currentRow) {
                    const columnIndex = addr % 8;
                    const cell = document.createElement('td'); // Create a table data cell for the item
                    // Padding 0s
                    if (item <= 0x0F) {
                        cell.textContent = `0${item.toString(16).toUpperCase()}`;
                    }
                    else {
                        cell.textContent = item.toString(16).toUpperCase();
                    }
                    currentRow.appendChild(cell); // Append the data cell to the current row
                    if (access === true && addr !== undefined && index === addr) {
                        this.highlightMemCell(currentRow, columnIndex);
                    }
                }
            });
        }
        static hostUpdateDiskDisplay(format) {
            const diskDisplay = document.getElementById("tableDisk");
            for (let t = 0; t < _Disk.numTracks; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {
                        /* const row = diskDisplay.insertRow();

                        const tsb = row.insertCell(0);
                        const inUse = row.insertCell(1);
                        const next = row.insertCell(2);
                        const data = row.insertCell(3);

                        let block = sessionStorage.getItem(_krnDiskDriver.createStorageKey(t, s, b));
                        let blockArr = block.split(':');
                        tsb.innerHTML = `${t.toString()}:${s.toString()}:${b.toString()}`;
                        tsb.style.backgroundColor = "#e1dcdc";
                        inUse.innerHTML = blockArr[0].slice(0,1);
                        next.innerHTML = blockArr[0].slice(1,4);
                        data.innerHTML = blockArr[1].toUpperCase(); */
                        const tsb = `${t.toString()}:${s.toString()}:${b.toString()}`;
                        const blockKey = _krnDiskDriver.createStorageKey(t, s, b);
                        let block = sessionStorage.getItem(blockKey);
                        let blockArr = block ? block.split(':') : ['', ''];
                        let row = diskDisplay.rows[t * _Disk.numSectors * _Disk.numBlocks + s * _Disk.numBlocks + b + 1];
                        if (!row) {
                            row = diskDisplay.insertRow();
                        }
                        let tsbCell = row.cells[0] || row.insertCell(0);
                        let inUseCell = row.cells[1] || row.insertCell(1);
                        let nextCell = row.cells[2] || row.insertCell(2);
                        let dataCell = row.cells[3] || row.insertCell(3);
                        tsbCell.innerHTML = tsb;
                        tsbCell.style.backgroundColor = "#e1dcdc";
                        inUseCell.innerHTML = blockArr[0].slice(0, 1);
                        nextCell.innerHTML = blockArr[0].slice(1, 4);
                        dataCell.innerHTML = blockArr[1].toUpperCase();
                    }
                }
            }
        }
    }
    TSOS.Devices = Devices;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=devices.js.map