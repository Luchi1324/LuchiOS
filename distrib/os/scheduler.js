var TSOS;
(function (TSOS) {
    class Scheduler {
        readyQueue;
        quantum;
        quantaCount;
        executingPCB;
        constructor() {
            this.readyQueue = new TSOS.Queue();
            this.quantum = 6;
            this.quantaCount = 1;
            this.executingPCB = null;
        }
        scheduleRR() {
            // If we don't have a process executing and it is in the ready queue ...
            if (this.executingPCB === null && this.readyQueue.getSize() > 0) {
                // ... then we load it into the CPU
                this.executingPCB = this.readyQueue.dequeue();
                _CPU.loadProgram(this.executingPCB);
            }
            else if (this.readyQueue.getSize() > 0) {
                // Otherwise if we have reached our Quantum ...
                if (this.quantaCount % this.quantum === 0) {
                    _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
                }
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map