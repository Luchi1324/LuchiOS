var TSOS;
(function (TSOS) {
    class Dispatcher {
        constructor() {
        }
        contextSwitch() {
            if (_Scheduler.readyQueue.getSize() > 0 && _CPU.currentPCB !== null) {
                let nextTask = _Scheduler.readyQueue.dequeue();
                _Scheduler.executingPCB = nextTask;
                _CPU.loadProgram(nextTask);
            }
            else if (_Scheduler.readyQueue.getSize() > 0) {
                _Scheduler.executingPCB.state = "Ready";
                _Scheduler.readyQueue.enqueue(_Scheduler.executingPCB);
                TSOS.Devices.hostUpdatePcbDisplay(_Scheduler.executingPCB);
                let nextTask = _Scheduler.readyQueue.dequeue();
                _Scheduler.executingPCB = nextTask;
                _CPU.loadProgram(nextTask);
            }
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map