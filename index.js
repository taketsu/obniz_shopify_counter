require('dotenv').config();
const Obniz = require('obniz');
const express = require('express');
const app = express();

let segment; // Segment LED
const offset = 1000;  // Offset between real number and order number
let currentCount = 0;

app.use(express.json());

async function changeDigit(pos, from, to, round = false) {
  if(round){
    await changeDigit(pos, 0, 9);
  }
  if(from > to){
    from = 0;
  }
  for (let d = from; d <= to; d++) {
    segment.setNumber(0, (7 - pos), d, false);
    obniz.wait(50);
  }
}

async function setNum(num) {
  const count = num - offset;
  const strNum = ("xxxxxxxx" + count).slice(-8);
  const strCurrentNum = ("xxxxxxxx" + currentCount).slice(-8);
  // in order of position
  for (let pos = 7; pos >= 0; pos--) {
    if (strCurrentNum[pos] != strNum[pos]) {
      // If the number changes
      let from = Number(strCurrentNum[pos]) || 0;
      let to = Number(strNum[pos]) || 0;
      if (strNum[pos] == "x") {
        await segment.setNumber(0, (7 - pos), "off", false);
      } else {
        await changeDigit(pos, from, to, ((strCurrentNum[pos] == "x") || (strCurrentNum[pos - 1] == "x") || ((from == 9) && (to == 0))));
      }
    }else{
      // If the number does not change but the next place changes
      if(pos < 7 && (strCurrentNum[pos - 1] != strNum[pos - 1])){
        // If it's a blank to a number, it goes around once.
        let to = Number(strNum[pos]) || 0;
        await changeDigit(pos, to, to, true);
      }
    }
  }
  currentCount = count;
}

var obniz = new Obniz(process.env.OBNIZ_ID);

obniz.onconnect = async function () {
  segment = obniz.wired("7SegmentLED_MAX7219", { clk: 0, cs: 1, din: 2, gnd: 3, vcc: 4 });
  segment.init(1, 8); // Connect one 8-digit display
  segment.setNumber(0, 0, 0, false);
  segment.setNumber(0, 1, "off", false);
  segment.setNumber(0, 2, "off", false);
  segment.setNumber(0, 3, "off", false);
  segment.setNumber(0, 4, "off", false);
  segment.setNumber(0, 5, "off", false);
  segment.setNumber(0, 6, "off", false);
  segment.setNumber(0, 7, "off", false);
}

app.get('/', async (req, res) => {
  const num = Number(req.query.count);
  await setNum(num);
  res.send('Sent to self-made counter.');
});

app.post('/webhook', async (req, res) => {
  const num = Number(req.body.name.match(/[0-9]+/)[0]);
  await setNum(num);
  res.send('Webhook: ' + req.body.name);
});

app.listen('3000', () => {
  console.log('Application started');
});