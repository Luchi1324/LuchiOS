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
        readBlockData(data) {
            // split the data into an array of hex pairings (regex: every 2 characters)
            let hexArr = data.match(/.{1,2}/g);
            let block = '';
            let i = 0;
            // loop through array and build block string
            while (i < hexArr.length) {
                block += hexArr[i];
                i++;
            }
            return block;
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
        findFile(fileName) {
            let startingBlockKey = null;
            let fileArr = [];
            directorySearch: for (let t = 0; t < 1; t++) {
                for (let s = 0; s < _Disk.numSectors; s++) {
                    for (let b = 0; b < _Disk.numBlocks; b++) {
                        let potentialKey = this.createStorageKey(t, s, b);
                        let dataArr = sessionStorage.getItem(potentialKey).split(":");
                        if (dataArr) {
                            let metaData = dataArr[0];
                            let fileData = this.trimData(dataArr[1]);
                            let isUsed = this.checkIfInUse(metaData);
                            if (isUsed && this.readBlockData(fileData) == (TSOS.Utils.txtToHex(fileName))) {
                                startingBlockKey = metaData.slice(1, 4);
                                // directory key
                                fileArr.push(potentialKey);
                                // starting block key
                                fileArr.push(metaData.slice(1, 4));
                                break directorySearch;
                            }
                        }
                    }
                }
            }
            return fileArr;
        }
        trimData(data) {
            let hexArr = data.match(/.{1,2}/g);
            let i = 0;
            let res = '';
            while (i < hexArr.length) {
                if (hexArr[i] != '00') {
                    res += hexArr[i];
                }
                else {
                    break;
                }
                i++;
            }
            return res;
        }
        checkIfInUse(data) {
            let isUsed = false;
            let dataArr = data.split("");
            if (dataArr[0] === "1") {
                isUsed = true;
            }
            return isUsed;
        }
    }
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverDisk.js.map