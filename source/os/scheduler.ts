module TSOS {
    export class Scheduler {
        public readyQueue: Queue;
        public quantum: number;
        public quantaCount: number;
        public executingPCB: ProcessControlBlock;

        constructor() {
            this.readyQueue = new Queue();
            this.quantum = 6;
            this.quantaCount = 0;
            this.executingPCB = null;
        }

        public scheduleRR(): void {
            if (this.executingPCB === null && this.readyQueue.getSize() > 0) {
                this.executingPCB = this.readyQueue.dequeue();
                _CPU.loadProgram(this.executingPCB);
            } else if (this.readyQueue.getSize() > 0) {
                if ((this.quantaCount + 1) % this.quantum === 0) {
                    _Kernel.krnInterruptHandler(CONTEXT_SWITCH_IRQ, 0);
                }
            }
        }
    }
}