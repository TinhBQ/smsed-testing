﻿import { jsPDF } from 'jspdf';
const font =
const callAddFont = function () {
  this.addFileToVFS('arial-normal.ttf', font);
  this.addFont('arial-normal.ttf', 'arial', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont]);