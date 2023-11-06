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
            this.quantaCount = 0;
            this.executingPCB = null;
        }
        scheduleRR() {
            // If we don't have a process executing and it is in the ready queue ...
            if (this.readyQueue.getSize() > 0) {
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            }
            else {
                // TODO: Insert more code to handle empty ready queue
                _Kernel.krnTrace("All processes have been completed.");
            }
        }
        quantaCheck() {
            this.quantaCount++;
            if (this.quantaCount % this.quantum === 0) {
                _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map