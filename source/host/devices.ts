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

module TSOS {

    export class Devices {

        constructor() {
            _hardwareClockID = -1;
        }

        //
        // Hardware/Host Clock Pulse
        //
        public static hostClockPulse(): void {
            // Increment the hardware (host) clock.
            _OSclock++;
            // Call the kernel clock pulse event handler.
            _Kernel.krnOnCPUClockPulse();
        }

        //
        // Keyboard Interrupt, a HARDWARE Interrupt Request. (See pages 560-561 in our text book.)
        //
        public static hostEnableKeyboardInterrupt(): void {
            // Listen for key press (keydown, actually) events in the Document
            // and call the simulation processor, which will in turn call the
            // OS interrupt handler.
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        }

        public static hostDisableKeyboardInterrupt(): void {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        }

        public static hostOnKeypress(event): void {
            // The canvas element CAN receive focus if you give it a tab index, which we have.
            // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
            if (event.target.id === "display") {
                event.preventDefault();
                // Note the pressed key code in the params (Mozilla-specific).
                var params = new Array(event.which, event.shiftKey, event.ctrlKey);
                // Enqueue this interrupt on the kernel interrupt queue so that it gets to the Interrupt handler.
                _KernelInterruptQueue.enqueue(new Interrupt(KEYBOARD_IRQ, params));
            }
        }

        public static hostUpdateCpuDisplay(init?: boolean): void {
            // HTML Context
            const cpuDisplay = <HTMLTableElement> document.getElementById("tableCpu");
            let currentRow: HTMLTableRowElement;

            // Removes previous row if the row is already initialized ...
            if (init !== true) { cpuDisplay.deleteRow(1); }
            // ... then updates current row based on the global _CPU's attributes
            let cpuAttr = [_CPU.PC, _CPU.instruReg, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _CPU.isExecuting];
            currentRow = cpuDisplay.insertRow(1);
            for (let i = 0; i < cpuAttr.length; i++) {
                let cell = currentRow.insertCell();
                typeof cpuAttr[i] === 'number' ? cell.textContent = `${cpuAttr[i].toString(16).toUpperCase()}` : cell.textContent = `${cpuAttr[i].toString()}`;
            }
        }

        public static hostUpdatePcbDisplay(pcb: ProcessControlBlock): void {
            // HTML Context
            const pcbDisplay = <HTMLTableElement> document.getElementById("tableProcess");
            let currentRow: HTMLTableRowElement;
            
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
            } else {
                currentRow = pcbDisplay.insertRow();
                for (let i = 0; i < pcbAttr.length; i++) {
                    let cell = currentRow.insertCell();
                    typeof pcbAttr[i] === 'number' ? cell.textContent = `${pcbAttr[i].toString(16).toUpperCase()}` : cell.textContent = `${pcbAttr[i].toString()}`;;
                }
            }
        }

        public static highlightMemCell(row: HTMLTableRowElement, addr: number) {
            let cells = row.getElementsByTagName('td');
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                cell.classList.remove('highlight');          // Remove highlight class from all cells ...
                cell.classList.remove('highlight-adjacent'); // ... and the adjacent highlights too
            }
        
            if (addr >= 0x00 && addr < cells.length) {
                // Add highlight class to the current cell ...
                let currentCell = cells[addr];
                currentCell.classList.add('highlight');
                
                // ... then get OPCODE adjacent highlight amount and add that
                let opcode = currentCell.textContent;
                let highlight = OPCODE_HIGHLIGHT_MAPPING.get(opcode);

                if (highlight !== undefined) {
                    let adjPos = addr + highlight;

                    if (adjPos >= 0 && adjPos < cells.length) {
                        let adjacentCell = cells[adjPos];
                        adjacentCell.classList.add('highlight-adjacent');
                    }
                }
            }
        }
        
        public static hostUpdateMemDisplay(access?: boolean, addr?: number): void {
            const memDisplay = <HTMLTableElement> document.getElementById("tableMemory");
            // Erases table to allow for new one
            memDisplay.innerHTML = "";

            _Memory.memArray.forEach((item, index) => {
                // Creates a new row for each item, and adds a heading row
                // I created this on my own originally, but I used ChatGPT to 'enhance' it by adding the 'th' element for the header rows.
                if (index % 8 === 0) {
                    const currentRow = document.createElement('tr'); // Create a new table row
                    const cell = document.createElement('th'); // Create a table header cell for the index
                    cell.textContent = `0x${index.toString(16).toUpperCase()}`;
                    currentRow.appendChild(cell);
                    memDisplay.appendChild(currentRow); // Append the heading row to the table
                }

                const currentRow = memDisplay.lastElementChild as HTMLTableRowElement;
                const columnIndex = addr % 8;

                const cell = document.createElement('td'); // Create a table data cell for the item

                // Padding 0s
                cell.textContent = item <= 0x0F ? `0${item.toString(16).toUpperCase()}` : item.toString(16).toUpperCase();
                currentRow.appendChild(cell); // Append the data cell to the current row

                if (access === true && addr !== undefined && index === addr) {
                    this.highlightMemCell(currentRow, columnIndex);
                }
            })
        }

        public static hostUpdateDiskDisplay(format?: boolean): void {
            const diskDisplay = <HTMLTableElement> document.getElementById("tableDisk");

            diskDisplay.innerHTML = "";
            
            for (let t = 0; t < _Disk.numTracks; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {
                        const row = diskDisplay.insertRow();

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
                        data.innerHTML = blockArr[1].toUpperCase();
                    }
                }
            }
        }
    }
}
