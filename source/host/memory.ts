module TSOS {

    export class Memory {

        constructor(public memArray = new Array<number>(0x100)) {
        }

        // Fills the main memory with empty values upon initialization
        public init(): void {
            this.memArray.fill(0x00);
        }

        // Below commands are used by memoryAccessor to work with 
        // Gets the value of a given address
        public getAddr(addr: number): number {
            return this.memArray[addr];
        } 

        // Sets the value of a given address
        public setAddr(addr: number, value: number) {
            if (addr <= 0xFF) {
                this.memArray[addr] = value;
            }
        }
    }
}