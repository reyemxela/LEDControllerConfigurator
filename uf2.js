const LAYOUT_VER = [0xAA, 0x03];
const FLASH_SIZE_MB = 2;
const EEPROM_START = (0x10000000 + (FLASH_SIZE_MB*0x100000) - 4096);
const LAYOUT_OFFSET = 256;
const FIRMWARE_URL = "firmware.uf2";
const OFFSETS = {
  magic1:    0,
  magic2:    4,
  flags:     8,
  address:   12,
  size:      16,
  blockno:   20,
  numblocks: 24,
  family:    28,
  data:      32,
  magic3:    508,
}


class Chunk {
  constructor(data = null) {
    this.header = new DataView(new ArrayBuffer(32));
    this.trailer = new DataView(new ArrayBuffer(4));

    if (data != null) {
      let dataview = new DataView(data.buffer);
      this.magic1     = dataview.getUint32(OFFSETS.magic1,     true);
      this.magic2     = dataview.getUint32(OFFSETS.magic2,     true);
      this.flags      = dataview.getUint32(OFFSETS.flags,      true);
      this.address    = dataview.getUint32(OFFSETS.address,    true);
      this.size       = dataview.getUint32(OFFSETS.size,       true);
      this.blockno    = dataview.getUint32(OFFSETS.blockno,    true);
      this.numblocks  = dataview.getUint32(OFFSETS.numblocks,  true);
      this.family     = dataview.getUint32(OFFSETS.family,     true);
      this.magic3     = dataview.getUint32(OFFSETS.magic3,     true);
      this.data       = data.slice(OFFSETS.data, OFFSETS.data + 476);
    } else {
      this.magic1    = 0x0A324655;
      this.magic2    = 0x9E5D5157;
      this.flags     = 0x2000;
      this.address   = 0x0;
      this.size      = 256;
      this.blockno   = 0;
      this.numblocks = 1;
      this.family    = 0xE48BFF56;
      this.magic3    = 0x0AB16F30;
      this.data      = new Uint8Array(476);
    }
  }

  getBlobData() {
    //                     offset               value             little endian
    this.header.setUint32(OFFSETS.magic1,       this.magic1,      true);
    this.header.setUint32(OFFSETS.magic2,       this.magic2,      true);
    this.header.setUint32(OFFSETS.flags,        this.flags,       true);
    this.header.setUint32(OFFSETS.address,      this.address,     true);
    this.header.setUint32(OFFSETS.size,         this.size,        true);
    this.header.setUint32(OFFSETS.blockno,      this.blockno,     true);
    this.header.setUint32(OFFSETS.numblocks,    this.numblocks,   true);
    this.header.setUint32(OFFSETS.family,       this.family,      true);
    this.trailer.setUint32(0,                   this.magic3,      true);

    return [this.header.buffer, this.data, this.trailer.buffer];
  }
}


class Layout {
  constructor(
    wing, nose, fuse, tail, nav,
    wingRev, noseRev, fuseRev,
    tailRev, noseFuseJoined
  ) {
    this.data = new Uint8Array([
      ...LAYOUT_VER,
      wing, nose, fuse, tail, nav,
      wingRev, noseRev, fuseRev,
      tailRev, noseFuseJoined
    ]);
  }
}


async function startDownload(
  wing, nose, fuse, tail, nav,
  wingRev, noseRev, fuseRev,
  tailRev, noseFuseJoined, configOnly
) {
  
  let layout = new Layout(
    wing,
    nose,
    fuse,
    tail,
    nav,
    wingRev,
    noseRev,
    fuseRev,
    tailRev,
    noseFuseJoined,
  );

  let layoutChunk = new Chunk();
  layoutChunk.address = EEPROM_START + LAYOUT_OFFSET;
  layoutChunk.data.set(layout.data, 0);

  let firmware = [];

  if (!configOnly) {
    let response = await fetch(FIRMWARE_URL);
    let data = new Uint8Array(await response.arrayBuffer());

    let chunk = new Chunk(data.slice(0, 512));
    let numBlocks = chunk.numblocks + 1
    chunk.numblocks = numBlocks;
    firmware.push(...chunk.getBlobData());

    for (let i = 512; i < data.length; i += 512) {
      let chunk = new Chunk(data.slice(i, i+512));
      chunk.numblocks = numBlocks;
      firmware.push(...chunk.getBlobData());
    }
    layoutChunk.blockno = numBlocks - 1;
    layoutChunk.numblocks = numBlocks;
  }

  firmware.push(...layoutChunk.getBlobData());

  let blob = new Blob(firmware, {type: 'application/octet-stream'});
  
  let link = document.createElement('a');
  link.download = 'test.bin';
  link.href = URL.createObjectURL(blob);

  link.click();
  URL.revokeObjectURL(blob);
}