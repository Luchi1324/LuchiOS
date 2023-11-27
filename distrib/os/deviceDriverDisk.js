var TSOS;
(function (TSOS) {
    class DeviceDriverDisk extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnKdbDriverEntry;
        }
        krnKdbDriverEntry() {
            this.status = "loaded";
        }
        // Creates an empty block
        createEmptyBlock() {
            return "0".repeat(4) + ":" + "0".repeat(_Disk.blockSize - 4);
        }
        // Creates a storage key to use with sessionStorage
        createStorageKey(track, sector, block) {
            return track.toString() + sector.toString() + block.toString();
        }
        formatDisk() {
            _Kernel.krnTrace("Beginning disk format...");
            for (var t = 0; t < _Disk.numTracks; t++) {
                for (var s = 0; s < _Disk.numSectors; s++) {
                    for (var b = 0; b < _Disk.numBlocks; b++) {
                        sessionStorage.setItem(this.createStorageKey(t, s, b), this.createEmptyBlock());
                    }
                }
            }
            _Disk.isFormatted = true;
            _Kernel.krnTrace("Disk formatted.");
            TSOS.Devices.hostUpdateDiskDisplay();
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