var TSOS;
(function (TSOS) {
    class Scheduler {
        readyQueue;
        quantum;
        quantaCount;
        executingPCB;
        constructor(readyQueue = new TSOS.Queue(), quantum = 6, quantaCount = 1, executingPCB = null) {
            this.readyQueue = readyQueue;
            this.quantum = quantum;
            this.quantaCount = quantaCount;
            this.executingPCB = executingPCB;
        }
        init() {
            this.readyQueue = new TSOS.Queue();
            this.quantum = 6;
            this.quantaCount = 1;
            this.executingPCB = null;
        }
        scheduleRR() {
            //alert("Scheduling!");
            // If we don't have a process executing and it is in the ready queue ...
            if (this.executingPCB === null && this.readyQueue.getSize() > 0) {
                // ... then we load it into the CPU
                //alert("Loading!");
                this.executingPCB = this.readyQueue.dequeue();
                _CPU.loadProgram(this.executingPCB);
            }
            else if (this.readyQueue.getSize() > 0) {
                // Otherwise if we have reached our Quantum ...
                if (this.quantaCount % this.quantum === 0) {
                    //alert("Interrupting!");
                    _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
                }
            }
            else {
                _StdOut.putText("There is nothing in the ready queue to schedule.");
                _StdOut.advanceLine();
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map