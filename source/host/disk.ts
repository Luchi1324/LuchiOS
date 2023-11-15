module TSOS {
    export class Disk {

        public numTracks: number;
        public numSectors: number;
        public numBlocks: number;
        public blockSize: number;
        public isFormatted: boolean;
        public isFull: boolean;

        constructor() {
            this.numTracks = 4;
            this.numSectors = 8;
            this.numBlocks = 8;
            this.blockSize = 64;
            this.isFormatted = false;
            this.isFull = false;
        }
    }
}