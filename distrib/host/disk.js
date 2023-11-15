var TSOS;
(function (TSOS) {
    class Disk {
        numTracks;
        numSectors;
        numBlocks;
        blockSize;
        isFormatted;
        isFull;
        constructor() {
            this.numTracks = 4;
            this.numSectors = 8;
            this.numBlocks = 8;
            this.blockSize = 64;
            this.isFormatted = false;
            this.isFull = false;
        }
    }
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=disk.js.map