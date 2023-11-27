var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        disk;
        constructor(disk = new TSOS.Disk()) {
            super();
            this.disk = disk;
            this.driverEntry = this.krnKdbDriverEntry;
        }
        krnKdbDriverEntry() {
            this.status = "loaded";
        }
        // Creates an empty block
        createEmptyBlock() {
            return "0".repeat(4) + ":" + "0".repeat(this.disk.blockSize - 4);
        }
        // Creates a storage key to use with sessionStorage
        createStorageKey(track, sector, block) {
            return track.toString() + sector.toString() + block.toString();
        }
        formatDisk() {
            _Kernel.krnTrace("Beginning disk format...");
            for (var t = 0; t < this.disk.numTracks; t++) {
                for (var s = 0; s < this.disk.numSectors; s++) {
                    for (var b = 0; b < this.disk.numBlocks; b++) {
                        sessionStorage.setItem(this.createStorageKey(t, s, b), this.createEmptyBlock());
                    }
                }
            }
            this.disk.isFormatted = true;
            _Kernel.krnTrace("Disk formatted.");
            // TODO: Create a disk table function, then insert it here
        }
        createFile(fileName) {
            let createdFlag = false;
        }
        readFile(fileName) {
        }
        writeFile(fileName) {
        }
        deleteFile(fileName) {
        }
        copyFile(fileName, newFileName) {
        }
        renameFile(fileName, newFileName) {
        }
        getAllFiles() {
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map